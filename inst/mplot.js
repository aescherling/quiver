
// globally accessible data variables, primarily for debugging
var myData;
var myVar;

// globally accessible color variable and size variable
var currentColor = 0;
var currentSize = 0;

// create an svg - everything will be drawn on this
var svg = d3.select('#viz').append('svg')
	.attr('height', '550px')
	.attr('width', '900px');

// add text elements for warnings about the data load
var categoricalWarning = svg.append('text').attr('y', 25);
var missingnessWarning = svg.append('text').attr('y', 50);

// create a scatterplot group
var scatterplot = svg.append('g')
	.attr('id', 'scatterplot')
	.attr('transform','translate(100,50)');

// scatterplot dimensions
var scatterHeight = 300;
var scatterWidth = 300;

// function for updating the y variable of the scatterplot
function updateY(x) {

	var xMin = d3.min(x);
	var xMax = d3.max(x);

	// relabel/rescale y axis of scatterplot
	scaleY = d3.scaleLinear().domain([Math.floor(xMin), Math.ceil(xMax)]).range([scatterHeight, 0]);
	d3.select('#scatterplot').select('.yAxis').call(d3.axisLeft(scaleY).ticks(5));

	// update points
	d3.select('#scatterplot').selectAll('.point')
		.transition()
		.duration(100)
		.attr('cy', function(d,i) {return scaleY(x[i])});

} // end of updateHist()


// function for updating the x variable of the scatterplot with input variable (array) x
function updateX(x) {

	var xMin = d3.min(x);
	var xMax = d3.max(x);

	// rescale/relabel x axis
	scaleX = d3.scaleLinear().domain([Math.floor(xMin), Math.ceil(xMax)]).range([0, scatterWidth]);
	d3.select('#scatterplot').select('.xAxis').call(d3.axisBottom(scaleX).ticks(5));

	// update points
	d3.selectAll('.point')
		.transition()
		.duration(100)
		.attr('cx', function(d,i) {return scaleX(x[i])});

} // end of updateHist()

// function for updating the color variable of the scatterplot
function updateColor(x) {

	var xMin = d3.min(x);
	var xMax = d3.max(x);

	scaleColor = d3.scaleLinear().domain([Math.floor(xMin), Math.ceil(xMax)]).range(["red", "blue"]);

	// update points
	d3.selectAll('.point')
		.style('fill', function(d,i) {return scaleColor(x[i])})
		.style('stroke', function(d,i) {return scaleColor(x[i])});

} // end of updateHist()


// function for updating the bubble size of the scatterplot
function updateSize(x) {

	var xMin = d3.min(x);
	var xMax = d3.max(x);

	bubbleScale = d3.scalePow().exponent(2).domain([Math.floor(xMin), Math.ceil(xMax)]).range([2.5, 15]);

	// update points
	d3.selectAll('.point')
		.attr('r', function(d,i) {return bubbleScale(x[i])});

} // end of updateHist()


// function for creating a variable selector
function makeSelector(id, data, variables, axis, transform) {
	// if a selector with this id already exists, remove it
	d3.selectAll('#' + id).remove();

	// set dimensions
    var width = scatterWidth;
    var height = 20;
    var textwidth = 55;
    var margin = 5;

	// create the scales
    var x = d3.scaleLinear()
    	.domain([0, variables.length-1])
    	.range([0, width - 2*margin]);

    var y = d3.scaleLinear()
    	.domain([0, variables.length-1])
    	.range([height/2, height/2]);

    // a line based on the scales
    var line = d3.line()
        .x(function(d, i) { return x(i); })
        .y(function(d, i) { return y(i); });

    // create a selector group
	var selector = svg.append('g')
		.attr('id', id)
		.attr('transform', transform);

	// add the line to the selector
	var path = selector.append('path')
      .datum(variables)
      .attr('d', line)
      .attr('style', 'fill: none; stroke: #000; stroke-width: 0.5px;');

    // dot shows the current variable selection
    var dot = selector.append("circle")
    	.attr('class', 'dot')
        .attr('cx', function() {
        	if (axis=="x") {
        		out = x(1);
        	} else if (axis=="y") {
        		out = x(0);
        	}
        	return(out);
        })
        .attr('cy', y(0))
        .attr("r", 5);

    // variable name
    var varName = selector.append("text")
    	.attr("x", 145)
    	.attr("y", function() {
    		if (axis=="x") {
    			return(-10);
    		} else {
    			return(40);
    		}
    	})
    	.attr("text-anchor", "middle")
    	.attr("text", "");

	// function for updating the x variable of the scatterplot using the selector
	function moveX() {
		var i = Math.min(Math.round(x.invert(d3.mouse(this)[0])), variables.length-1);
		dot.attr('cx', x(i)).attr('cy', y(i));
		varName.text(variables[i]);
	
		// update the histogram to view the selected variable
		var newVar = data.map(function(d) {return +d[variables[i]]});
		updateX(newVar);
	}

	// function for updating the y variable of scatterplot using the selector
	function moveY() {
		var i = Math.min(Math.round(x.invert(d3.mouse(this)[0])), variables.length-1);
		dot.attr('cx', x(i)).attr('cy', y(i));
		varName.text(variables[i]);
	
		// update the histogram to view the selected variable
		var newVar = data.map(function(d) {return +d[variables[i]]});
		updateY(newVar);
	}

    var overlay = selector.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .attr("style", "fill: none; pointer-events: all;");

    if (axis=="x") {
        overlay.on("mousemove", moveX);
    } else if (axis=="y") {
    	overlay.on("mousemove", moveY);
    }

    return(selector);
} // end of makeSelector();


// function for creating a variable selector for color
function makeColorSelector(id, data, variables, transform) {

	var colorVariables = ["None"].concat(variables);

	// if a selector with this id already exists, remove it
	d3.selectAll('#' + id).remove();

	// set dimensions
    var width = scatterWidth;
    var height = 20;
    var textwidth = 55;
    var margin = 5;

	// create the scale
    var x = d3.scaleLinear()
    	.domain([0, colorVariables.length-1])
    	.range([0, width - 2*margin]);

    var y = d3.scaleLinear()
    	.domain([0, colorVariables.length-1])
    	.range([height/2, height/2]);

    // a line based on the scales
    var line = d3.line()
        .x(function(d, i) { return x(i); })
        .y(function(d, i) { return y(i); });

    // create a selector group
	var selector = svg.append('g')
		.attr('id', id)
		.attr('transform', transform);

	// add the line to the selector
	var path = selector.append('path')
      .datum(colorVariables)
      .attr('d', line)
      .attr('style', 'fill: none; stroke: #000; stroke-width: 0.5px;');

    // dot shows the current variable selection
    var dot = selector.append("circle")
    	.attr('class', 'dot')
        .attr('cx', x(0))
        .attr('cy', y(0))
        .attr("r", 5);

    // variable name
    var varName = selector.append("text")
    	.attr('id','colorText')
    	.attr("x", 145)
    	.attr("y", -10)
    	.attr("text-anchor", "middle")
    	.text("Color: None");

	// function for updating the color variable
	function changeColor() {
		var i = Math.min(Math.round(x.invert(d3.mouse(this)[0])), colorVariables.length-1);
		dot.attr('cx', x(i)).attr('cy', y(i));
		varName.text('Color: ' + colorVariables[i]);

		// make sure the color section has changed
		// if i==0 then "None" is selected
		if (i!=currentColor & i!=0) {
			// update the histogram to view the selected variable
			var newVar = data.map(function(d) {return +d[colorVariables[i]]});
			updateColor(newVar);
		} else if (i!=currentColor) {
			d3.selectAll('.point')
				.style('fill','none')
				.style('stroke','black');
		}

		currentColor = i;
		
	}

    var overlay = selector.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .attr("style", "fill: none; pointer-events: all;")
        .on("mousemove", changeColor);

    return(selector);
} // end of makeSelector();



// function for creating a variable selector for size of points
function makeSizeSelector(id, data, variables, transform) {

	var sizeVariables = ["None"].concat(variables);

	// if a selector with this id already exists, remove it
	d3.selectAll('#' + id).remove();

	// set dimensions
    var width = scatterWidth;
    var height = 20;
    var textwidth = 55;
    var margin = 5;

	// create the scale
    var x = d3.scaleLinear()
    	.domain([0, sizeVariables.length-1])
    	.range([0, width - 2*margin]);

    var y = d3.scaleLinear()
    	.domain([0, sizeVariables.length-1])
    	.range([height/2, height/2]);

    // a line based on the scales
    var line = d3.line()
        .x(function(d, i) { return x(i); })
        .y(function(d, i) { return y(i); });

    // create a selector group
	var selector = svg.append('g')
		.attr('id', id)
		.attr('transform', transform);

	// add the line to the selector
	var path = selector.append('path')
      .datum(sizeVariables)
      .attr('d', line)
      .attr('style', 'fill: none; stroke: #000; stroke-width: 0.5px;');

    // dot shows the current variable selection
    var dot = selector.append("circle")
    	.attr('class', 'dot')
        .attr('cx', x(0))
        .attr('cy', y(0))
        .attr("r", 5);

    // variable name
    var varName = selector.append("text")
    	.attr('id','colorText')
    	.attr("x", 145)
    	.attr("y", -10)
    	.attr("text-anchor", "middle")
    	.text("Size: None");

	// function for updating the color variable
	function changeSize() {
		var i = Math.min(Math.round(x.invert(d3.mouse(this)[0])), sizeVariables.length-1);
		dot.attr('cx', x(i)).attr('cy', y(i));
		varName.text('Size: ' + sizeVariables[i]);

		// make sure the scale section has changed
		// if i==0 then "None" is selected
		if (i!=currentSize & i!=0) {
			var newVar = data.map(function(d) {return +d[sizeVariables[i]]});
			updateSize(newVar);
		} else if (i!=currentSize) {
			d3.selectAll('.point')
				.attr('r',3.5);
		}

		currentSize = i;
		
	}

    var overlay = selector.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .attr("style", "fill: none; pointer-events: all;")
        .on("mousemove", changeSize);

    return(selector);
} // end of makeSelector();




// function to plot the data
function explore(data) {

	// get a list of the variable names
	var varNames = Object.keys(data[1][0]);

	// remove all scatterplot points
	d3.select('#scatterplot').selectAll('.point').remove();

    // create a toolbar for switching the y variable
    var selector1 = makeSelector('selector1', data[0], varNames, 'y', 'translate(20,343) rotate(270)');

    // create a toolbar for switching the x variable
    var selector2 = makeSelector('selector2', data[0], varNames, 'x', 'translate(107,410)');

    // create a toolbar for switching the color variable
    var colorSelector = makeColorSelector('colorSelector', data[0], varNames, 'translate(500,100)');

    // create a toolbar for switching the scale variable
    var sizeSelector = makeSizeSelector('sizeSelector', data[0], varNames, 'translate(500,200)');

	// create crossfilter
	// var cf = crossfilter(data);

	// default to selecting the first variable for the y axis
	d3.select('#selector1').select('text').text(varNames[0]);
	var y = data[0].map(function(d) {return +d[varNames[0]]});
	var yMin = d3.min(y);
	var yMax = d3.max(y);
	scaleY = d3.scaleLinear().domain([Math.floor(yMin), Math.ceil(yMax)]).range([scatterHeight, 0]);

	// default to selecting the second variable for the x axis
	d3.select('#selector2').select('text').text(varNames[1]);
	var x = data[0].map(function(d) {return +d[varNames[1]]});
	var xMin = d3.min(x);
	var xMax = d3.max(x);
	scaleX = d3.scaleLinear().domain([Math.floor(xMin), Math.ceil(xMax)]).range([0, scatterWidth]);

	// draw axes of scatterplot
	scatterplot.append('g')
	  .attr('class', 'axis yAxis')
	  .call(d3.axisLeft(scaleY).ticks(5));
	
	scatterplot.append('g')
	  .attr('class', 'axis xAxis')
	  .attr('transform', 'translate(0,' + scatterHeight + ')')
	  .call(d3.axisBottom(scaleX).ticks(5));

	// add points to the scatterplot
	d3.select('#scatterplot').selectAll(".point")
		.data(data[0])
		.enter().append("circle")
		.attr("class", "point")
		.attr("r", 3.5)
		.attr("cx", function(d) {return scaleX(+d[varNames[1]])})
		.attr("cy", function(d) {return scaleY(+d[varNames[0]])})
		.style("fill", "none")
		.style("stroke","black")
		.style("opacity",0.6);

	// updateY(y);
	

} // end of explore



myData = ```jsonData''';
explore(myData);


