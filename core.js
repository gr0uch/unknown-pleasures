(function() {

  (function(window) {
    var AUDIO_FILE, dancer, data, delta, doTransform, getData, gradient, initData, isDrag, k, line, loaded, maxTransform, move, noise, origin, pulsar, rows, settings, spectrum, transform, transformObject, transformPulse, x, y, _ref;
    if (navigator.userAgent.match("MSIE")) d3.select('h1').html("Unsupported");
    rows = 72;
    gradient = [0, 0, 0, 0, 0.16, 0.28, 0.40, 0.66, 1, 1, 0.92, 0.86, 0.92, 1, 1, 0.66, 0.40, 0.28, 0.16, 0, 0, 0, 0];
    noise = function() {
      return Math.random() / 15;
    };
    initData = function(rows) {
      var data, x, y, _ref, _ref2;
      data = [];
      for (y = 0, _ref = rows - 1; 0 <= _ref ? y <= _ref : y >= _ref; 0 <= _ref ? y++ : y--) {
        data.push([]);
        for (x = 0, _ref2 = gradient.length - 1; 0 <= _ref2 ? x <= _ref2 : x >= _ref2; 0 <= _ref2 ? x++ : x--) {
          data[y].push(noise());
        }
      }
      return data;
    };
    getData = function() {
      var data, r, step, val, _ref;
      data = [];
      for (r = 0, _ref = gradient.length - 1; 0 <= _ref ? r <= _ref : r >= _ref; 0 <= _ref ? r++ : r--) {
        if (spectrum !== void 0) {
          step = Math.floor((spectrum.length / gradient.length) / 2);
          if (spectrum[r * step] !== void 0) {
            val = spectrum[10 + r * step] * 500;
            if (val > 1) val = 1 - Math.random() * 0.4;
            val *= gradient[r];
          } else {
            val = 0;
          }
        }
        if (val <= 0.01) val = noise();
        data.push(val);
      }
      return data;
    };
    data = initData(rows);
    settings = {
      amplitude: 50,
      update: 80,
      width: 600,
      height: 700,
      padding: [5, 5, 5, 5]
    };
    d3.select('#pulsar').style("width", settings.width + "px").style("height", settings.height + "px");
    x = d3.scale.linear().domain([0, data[0].length - 1]).range([settings.padding[3], settings.width - settings.padding[1]]);
    y = d3.scale.linear().domain([0, 1]).range([settings.amplitude - settings.padding[2], settings.padding[0]]);
    line = d3.svg.line().interpolate("cardinal").tension(0.8).x(function(d, i) {
      return x(i);
    }).y(function(d) {
      return y(d);
    });
    pulsar = [];
    for (k = 0, _ref = data.length - 1; 0 <= _ref ? k <= _ref : k >= _ref; 0 <= _ref ? k++ : k--) {
      pulsar[k] = d3.select('#pulsar').append("svg:svg").attr("width", settings.width).attr("height", settings.amplitude).style("top", (k / (data.length - 1)) * (settings.height - settings.amplitude) + "px").append("svg:g");
      pulsar[k].selectAll("path").data([data[k]]).enter().append("svg:path").attr("d", (function() {
        return line(data[k]);
      })());
    }
    setInterval(function() {
      move();
    }, settings.update);
    move = function() {
      var q, _ref2;
      data.shift();
      data.push(getData());
      for (q = 0, _ref2 = data.length - 1; 0 <= _ref2 ? q <= _ref2 : q >= _ref2; 0 <= _ref2 ? q++ : q--) {
        pulsar[q].selectAll("path").data([data[q]]).attr("d", (function() {
          return line(data[q]);
        })());
      }
    };
    window.onresize = function() {
      var mid;
      mid = window.innerHeight / 2 - settings.height / 2 - settings.amplitude * 0.2;
      if (mid < 0) mid = 0;
      d3.select("#pulsar").style("top", mid + "px");
      return d3.select("h1").style("top", mid + "px");
    };
    window.onresize();
    isDrag = false;
    origin = [];
    delta = [];
    transform = [0, 0];
    maxTransform = [65, 75];
    transformObject = d3.select('#pulsar');
    transformPulse = transformObject.selectAll('svg');
    doTransform = function(tx) {
      var popup;
      transformObject.style("-moz-transform", "rotateY(" + tx[0] + "deg) rotateX(" + (-tx[1]) + "deg)");
      transformObject.style("-webkit-transform", "rotateY(" + tx[0] + "deg) rotateX(" + (-tx[1]) + "deg)");
      transformObject.style("transform", "rotateY(" + tx[0] + "deg) rotateX(" + (-tx[1]) + "deg)");
      popup = Math.sqrt(tx[0] * tx[0] * 0.2 + tx[1] * tx[1]);
      if (popup > maxTransform[1]) popup = maxTransform[1];
      transformPulse.style("-moz-transform", "rotateX(" + (-popup) + "deg)");
      return transformPulse.style("-webkit-transform", "rotateX(" + (-popup) + "deg)");
    };
    doTransform([0, 0]);
    window.onmousedown = function(e) {
      isDrag = true;
      origin[0] = e.pageX;
      origin[1] = e.pageY;
      return false;
    };
    window.onmousemove = function(e) {
      if (isDrag) {
        delta[0] = (e.pageX - origin[0]) / 2;
        delta[1] = (e.pageY - origin[1]) / 2;
        origin[0] = e.pageX;
        origin[1] = e.pageY;
        transform[0] += delta[0];
        transform[1] += delta[1];
        transform[0] = transform[0] > maxTransform[0] ? maxTransform[0] : transform[0];
        transform[0] = transform[0] < -maxTransform[0] ? -maxTransform[0] : transform[0];
        transform[1] = transform[1] > 0 ? 0 : transform[1];
        transform[1] = transform[1] < -maxTransform[1] ? -maxTransform[1] : transform[1];
        doTransform([transform[0], transform[1]]);
      }
    };
    window.onmouseup = function() {
      isDrag = false;
    };
    document.addEventListener('touchstart', function(e) {
      return window.onmousedown(e);
    });
    document.addEventListener('touchmove', function(e) {
      return window.onmousemove(e);
    });
    document.addEventListener('touchend', function(e) {
      return window.onmouseup(e);
    });
    AUDIO_FILE = d3.select('#pulsar').attr("data-music");
    spectrum = {};
    Dancer.addPlugin('fft', function() {
      this.bind('update', function() {
        return spectrum = this.getSpectrum();
      });
    });
    Dancer.setOptions({
      flashJS: './lib/soundmanager2.js',
      flashSWF: './lib/soundmanager2.swf'
    });
    dancer = new Dancer(AUDIO_FILE, ['ogg', 'mp3']);
    dancer.fft();
    loaded = function() {
      d3.select('h1').style('display', 'none');
      return dancer.play();
    };
    dancer.bind('loaded', loaded);
    window.data = data;
  })(window);

}).call(this);
