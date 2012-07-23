# Unknown Pleasures

do (window) ->

	# IE unsupported
	if navigator.userAgent.match "MSIE"
		d3.select('h1').html "Unsupported"

	rows = 72
	gradient = [0,0,0,0,0.16,0.28,0.40,0.66,1,1,0.92,0.86,0.92,1,1,0.66,0.40,0.28,0.16,0,0,0,0]

	noise = () ->
		Math.random()/15

	initData = (rows) ->
		data = []
		for y in [0..rows-1]
			data.push []
			for x in [0..gradient.length-1]
				data[y].push noise()
		data

	getData = () ->
		data = []
		for r in [0..gradient.length-1]
			if spectrum != undefined
				step = Math.floor (spectrum.length/gradient.length)/2
				if spectrum[r*step] != undefined
					val = spectrum[10+r*step]*500
					if val > 1
						val = 1 - Math.random()*0.4
					val *= gradient[r]
				else
					val = 0
			if val <= 0.01
				val = noise()
			data.push val
		data
	data = initData(rows)


	#------------------------------
	# d3
	#------------------------------

	settings = {
		amplitude: 50,
		update: 80,
		width: 600,
		height: 700,
		padding: [5,5,5,5]
	}
	d3.select('#pulsar')
		.style("width",settings.width+"px")
		.style("height",settings.height+"px")

	x = d3.scale.linear().domain([0, data[0].length-1])
		.range([settings.padding[3], settings.width-settings.padding[1]])
	y = d3.scale.linear().domain([0, 1])
		.range([settings.amplitude-settings.padding[2],settings.padding[0]])

	line = d3.svg.line().interpolate("cardinal").tension(0.8)
		.x((d,i) -> x(i))
		.y((d) -> y(d))

	pulsar = []
	for k in [0..data.length-1]
		pulsar[k] = d3.select('#pulsar').append("svg:svg")
			.attr("width",settings.width)
			.attr("height",settings.amplitude)
			.style("top",(k/(data.length-1))*(settings.height-settings.amplitude)+"px")
			.append("svg:g")

		pulsar[k].selectAll("path").data([data[k]]).enter()
			.append("svg:path").attr("d", do ->
				line(data[k])
			)

	setInterval ->
		move()
		return
	, settings.update

	move = () ->
		data.shift()
		data.push getData()
		for q in [0..data.length-1]
			pulsar[q].selectAll("path").data([data[q]])
				.attr("d", do ->
					line(data[q])
			)
		return

	window.onresize = ->
		mid = window.innerHeight/2-settings.height/2-settings.amplitude*0.2
		if mid < 0 then mid = 0
		d3.select("#pulsar").style("top",mid+"px")
		d3.select("h1").style("top",mid+"px")
	window.onresize()

	#------------------------------
	# Mouse drag
	#------------------------------

	isDrag = false
	origin = []
	delta = []
	transform = [0,0]
	maxTransform = [65,75]

	transformObject = d3.select('#pulsar')
	transformPulse = transformObject.selectAll('svg')
	doTransform = (tx) ->
		transformObject.style("-moz-transform","rotateY("+(tx[0])+"deg) rotateX("+(-tx[1])+"deg)")
		transformObject.style("-webkit-transform","rotateY("+(tx[0])+"deg) rotateX("+(-tx[1])+"deg)")
		transformObject.style("transform","rotateY("+(tx[0])+"deg) rotateX("+(-tx[1])+"deg)")
		popup = Math.sqrt(tx[0]*tx[0]*0.2 + tx[1]*tx[1])
		if popup > maxTransform[1]
			popup = maxTransform[1]
		transformPulse.style("-moz-transform","rotateX("+(-popup)+"deg)")
		transformPulse.style("-webkit-transform","rotateX("+(-popup)+"deg)")
	doTransform([0,0]) # init

	window.onmousedown = (e) ->
		isDrag = true
		origin[0] = e.pageX
		origin[1] = e.pageY
		false

	window.onmousemove = (e) ->
		if isDrag
			delta[0] = (e.pageX - origin[0])/2
			delta[1] = (e.pageY - origin[1])/2
			origin[0] = e.pageX
			origin[1] = e.pageY
			transform[0] += delta[0]
			transform[1] += delta[1]
			transform[0] = if transform[0] > maxTransform[0] then maxTransform[0] else transform[0]
			transform[0] = if transform[0] < -maxTransform[0] then -maxTransform[0] else transform[0]
			transform[1] = if transform[1] > 0 then 0 else transform[1]
			transform[1] = if transform[1] < -maxTransform[1] then -maxTransform[1] else transform[1]
			doTransform([transform[0],transform[1]])
		return

	window.onmouseup = () ->
		isDrag = false
		return

	# preliminary touchscreen support, need to test it
	document.addEventListener 'touchstart', (e) -> window.onmousedown(e)
	document.addEventListener 'touchmove', (e) -> window.onmousemove(e)
	document.addEventListener 'touchend', (e) -> window.onmouseup(e)

	#------------------------------
	# dancer.js
	#------------------------------

	AUDIO_FILE = d3.select('#pulsar').attr("data-music")

	spectrum = {}
	Dancer.addPlugin( 'fft', () ->
		this.bind('update', () ->
			spectrum = this.getSpectrum()
		)
		return
	)
	Dancer.setOptions {
		flashJS  : './lib/soundmanager2.js',
		flashSWF : './lib/soundmanager2.swf'
	}

	dancer = new Dancer( AUDIO_FILE, [ 'ogg', 'mp3' ] )

	dancer.fft()

	loaded = () ->
		d3.select('h1').style('display','none')
		dancer.play()

	dancer.bind 'loaded', loaded

	window.data = data

	return