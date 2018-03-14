
// globally accessible data variables
var myData;
var varNames;
var cf;

// create an svg - everything will be drawn on this
var svg = d3.select('#viz').append('svg')
	.attr('height', '550px')
	.attr('width', '900px');

// create a table group
var table = svg.append('g')
	.attr('id', 'table')
	.attr('transform','translate(50,50)');

table.append('rect')
	.attr('x','10px')
	.attr('y','5px')
	.attr('width','810px')
	.attr('height','300px')
	.attr('style','fill:none; stroke:black');

// set the max number of rows and columns to be viewed at a time
var nrow = 15;
var ncol = 5;

// set global vars for number of rows, columns of data
var n;
var p;

// create a range of indicators for table row IDs
var tableRowIDs = [];
for (var i = 0; i < nrow; i++) {
    tableRowIDs.push(i);
}

// create a similar range for table column IDs
var tableColIDs = [];
for (var i = 0; i < ncol; i++) {
    tableColIDs.push(i);
}

// create ranges for data row and column IDs
var dataRowIDs = [];
var dataColIDs = [];


// variable for the current first row and first column being shown
var currentRow = 0;
var currentCol = 0;

// variable for variable to sort on
var sortVar = "";


// function for creating a slider
function makeSlider(id, variables, axis, length, transform) {
	// if a selector with this id already exists, remove it
	d3.selectAll('#' + id).remove();

	// set dimensions
    var width = length;
    var height = 20;
    var textwidth = 55;
    var margin = 5;

	// create the scales
	if (axis=="col") {
    	var x = d3.scaleLinear()
    		.domain([0, variables.length-1])
    		.range([0, width - 2*margin]);
    } else if (axis=="row") {
    	var x = d3.scaleLinear()
    		.domain([0, variables.length])
    		.range([width - 2*margin, 0]);
    }

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
        .attr('cx', x(0))
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

	// function for sliding across rows
	function slide() {
		var tmp = Math.min(Math.round(x.invert(d3.mouse(this)[0])), variables.length-1);
		dot.attr('cx', x(tmp)).attr('cy', y(tmp));

		if (axis=="row") {
			currentRow = d3.max([0,tmp]);
			currentRow = d3.min([tmp, variables.length-1])	
		} else if (axis=="col") {
			currentCol = d3.max([0,tmp]);
			currentCol = d3.min([tmp, variables.length-1])
		}
	
	    // replace all data
		d3.selectAll('.cell').remove();
		
		// create a text object in each cell of the table
		for (i in tableRowIDs) {
			var tmpRow = d3.select('#row' + i)
			for (j in tableColIDs) {
				// check to make sure such a row/column exists
				var checkOverflow = ((+currentRow + +i) < n) & ((+currentCol + +j) < p);
				if (checkOverflow) {
					txtTmp = myData[+currentRow + +i][varNames[+currentCol + +j]];
					if (txtTmp.length > 19) {
						txtTmp = txtTmp.substring(0,16) + "...";
					}
					tmpRow.append('text')
						.attr('id','cell' + i + ',' + j)
						.classed('cell',true)
						.classed('col'+i, true)
						.attr('transform','translate(' + (95 + (160 * j)) + ',0)')
						.attr('text-anchor','middle')
						.attr('style', 'font-size: 14px; font-family:monospace')
						.text(txtTmp);
				}
			}
		}

        // adjust row/column titles
		if (axis=="row") {
			// replace row IDs
			d3.selectAll('.rowTitle').remove();
			rowIDsTmp = [];
			for (var i = 0; i < nrow; i++) {
				if (+currentRow + +i < dataRowIDs.length) {
					rowIDsTmp.push(+currentRow + +i);	
				}
			}
			d3.select('#rowTitleGroup').selectAll('text')
				.data(rowIDsTmp)
				.enter()
				.append('text')
				.classed('titleCell', true)
				.classed('rowTitle', true)
				.attr('id', function(d, i) {return ('rowID' + +i + 1);})
				.attr('text-anchor','middle')
				.attr('style', 'font-size: 14px; font-weight: bold; font-family:monospace')
				.attr('transform',function(d, i) {return 'translate(-10,' + (20 * (+i +1 )) + ')'})
				.text(function(d) {return (myData[d].rowNumber + 1)});

			// color the odd rows
			for (i in tableRowIDs) {
				if ((+rowIDsTmp[i] % 2) ==0) {
					d3.select('#row' + i + 'Rect').attr('style','fill:skyblue');
				} else {
					d3.select('#row' + i + 'Rect').attr('style','fill:none');
				}
			}

		} else if (axis=="col") {
			// replace column IDs
			d3.selectAll('.columnTitle').remove();
			varNamesTmp = [];
			for (var j = 0; j < ncol; j++) {
				if (+currentCol + +j < dataColIDs.length) {
					varNamesTmp.push(varNames[+currentCol + +j]);	
				}
			}

			d3.select('#columnTitleGroup').selectAll('text')
				.data(varNamesTmp)
				.enter()
				.append('text')
				.classed('titleCell', true)
				.classed('columnTitle', true)
				.attr('id', function(d,i) {return ('column' + i);})
				.attr('text-anchor','middle')
				.attr('style', 'font-size: 14px; font-weight: bold; font-family:monospace; cursor:pointer')
				.attr('transform',function(d,i) {return 'translate(' + (95 + (160 * i)) + ',0)'})
				.on('click',function(d,i) {
					newVar = varNames[currentCol + i];
					if (sortVar==newVar) {
						sortData("bottom");
						sortVar = "";
					} else {
						sortVar = newVar;
						sortData("top");
					}
				})
				.text(function(d) {return (d)});
		}		

	} // end of slide()

    var overlay = selector.append("rect")
        .attr("class", "overlay")
        .attr("width", width - 2 * margin)
        .attr("height", height)
        .attr("style", "fill: none; pointer-events: all")
        .on("mousemove", slide);

    return(selector);
} // end of makeSelector();


function sortData(method) {
	// create a dimension for filtering
	DimTmp = cf.dimension(function(d) {return d[sortVar]});
	if (method=="top") {
		myData = DimTmp.top(n); 
	} else if (method=="bottom") {
		myData = DimTmp.bottom(n);
	}
	DimTmp.dispose();
	cf = crossfilter(myData);

	// replace all data
	d3.selectAll('.cell').remove();
		
	// create a text object in each cell of the table
	for (i in tableRowIDs) {
		var tmpRow = d3.select('#row' + i)
		for (j in tableColIDs) {
			// check to make sure such a row/column exists
			var checkOverflow = ((+currentRow + +i) < n) & ((+currentCol + +j) < p);
			if (checkOverflow) {
				txtTmp = myData[+currentRow + +i][varNames[+currentCol + +j]];
				if (txtTmp.length > 19) {
					txtTmp = txtTmp.substring(0,16) + "...";
				}
				tmpRow.append('text')
					.attr('id','cell' + i + ',' + j)
					.classed('cell',true)
					.classed('col'+i, true)
					.attr('transform','translate(' + (95 + (160 * j)) + ',0)')
					.attr('text-anchor','middle')
					.attr('style', 'font-size: 14px; font-family:monospace')
					.text(txtTmp);
			}
		}
	}

	// update the row numbers
	d3.selectAll('.rowTitle').remove();
	d3.select('#rowTitleGroup').selectAll('text')
		.data(tableRowIDs)
		.enter()
		.append('text')
		.classed('titleCell', true)
		.classed('rowTitle', true)
		.attr('id', function(d) {return ('rowID' + +d + 1);})
		.attr('text-anchor','middle')
		.attr('style', 'font-size: 14px; font-weight: bold; font-family:monospace')
		.attr('transform',function(d) {return 'translate(-10,' + (20 * (+d +1 )) + ')'})
		.text(function(d) {return (myData[currentRow + +d].rowNumber + 1)});

}


// function to plot the data
function explore(data) {

	// get the dimensions of the table
	n = data.length;
	p = Object.keys(data[0]).length;

	// get a list of the variable names
	varNames = Object.keys(data[0]);

	// add row numbers to the data
	data.map(function(d,i) {d.rowNumber = i});

	// create crossfilter
	cf = crossfilter(data);

	for (var i = 0; i < n; i++) {
	    dataRowIDs.push(i);
	}

	for (var i = 0; i < p; i++) {
	    dataColIDs.push(i);
	}

    var tableColNames = [];
    for (var i=0; i<ncol; i++) {
    	tableColNames.push(varNames[i]);
    }


	// create the row groups and background rects for highlighting
	table.selectAll('g')
	  .data(tableRowIDs).enter()
	  .append('g')
	  .classed('tableRow', true)
	  .attr('id', function (d) {return("row" + d);})
	  .attr('transform', function(d) {return 'translate(0,' + (20 * (d+1)) + ')'});

	// create a text object in each cell of the table
	// also create a rectangle behind the row for coloring
	for (i in tableRowIDs) {
		var tmpRow = d3.select('#row' + i)
		for (j in tableColIDs) {
			txtTmp = data[i][varNames[j]];
			if (txtTmp.length > 19) {
				txtTmp = txtTmp.substring(0,16) + "...";
			}
			tmpRow.append('text')
				.attr('id','cell' + i + ',' + j)
				.classed('cell',true)
				.classed('col'+i, true)
				.attr('text-anchor','middle')
				.attr('transform','translate(' + (95 + (160 * j)) + ',0)')
				.attr('style', 'font-size: 14px; font-family:monospace')
				.text(txtTmp);
			tmpRow.append('rect')
				.attr('id','row'+ i +'Rect')
				.attr('transform','translate(10,-15)')
				.attr('width','810px')
				.attr('height','20px')
				.attr('style','fill:none;stroke:none')
				.attr('opacity',0.25);
		}
	}

	// color the odd rows (1st row is 0)
	for (i in tableRowIDs) {
		if ((+i % 2) ==0) {
			d3.select('#row' + i + 'Rect').attr('style','fill:skyblue');
		} else {
			d3.select('#row' + i + 'Rect').attr('style','fill:none');
		}
	}

	// create a group for the titles and append text
	var columnTitleGroup = table.append('g').attr('id', 'columnTitleGroup');
	columnTitleGroup.selectAll('text')
		.data(tableColNames)
		.enter()
		.append('text')
		.classed('titleCell', true)
		.classed('columnTitle', true)
		.attr('id', function(d,i) {return ('column' + i);})
		.attr('text-anchor','middle')
		.attr('style', 'font-size: 14px; font-weight: bold; font-family:monospace; cursor:pointer')
		.attr('transform',function(d,i) {return 'translate(' + (95 + (160 * i)) + ',0)'})
		.on('click',function(d,i) {
			newVar = varNames[currentCol + i];
			if (sortVar==newVar) {
				sortData("bottom");
				sortVar = "";
			} else {
				sortVar = newVar;
				sortData("top");
			}
		})
		.text(function(d) {return (d)});

	// create a group for the row numbers append text
	var rowTitleGroup = table.append('g').attr('id', 'rowTitleGroup');
	rowTitleGroup.selectAll('text')
		.data(tableRowIDs)
		.enter()
		.append('text')
		.classed('titleCell', true)
		.classed('rowTitle', true)
		.attr('id', function(d) {return ('rowID' + +d + 1);})
		.attr('text-anchor','middle')
		.attr('style', 'font-size: 14px; font-weight: bold; font-family:monospace')
		.attr('transform',function(d) {return 'translate(-10,' + (20 * (+d +1 )) + ')'})
		.text(function(d) {return (+d + 1)});


	// create a slider for the rows
	if (n > nrow) {
		var slider1 = makeSlider('slider1', dataRowIDs, 'row', 300, 'translate(0,350) rotate(270)');	
	}
    

    // create a slider for the columns
    if (p > ncol) {
    	var slider2 = makeSlider('slider2', dataColIDs, 'col', 600, 'translate(107,410)');
    }
	
	// add a title for the row column
	table.append('text')
		.attr('id', 'rowNumberTitle')
		.attr('text-anchor','middle')
		.attr('style', 'font-size: 14px; font-weight: bold; font-family:monospace; cursor:pointer')
		.attr('transform',function(d,i) {return 'translate(-10,0)'})
		.on('click',function(d,i) {
			newVar = "rowNumber";
			if (sortVar==newVar) {
				sortData("bottom");
				sortVar = "";
			} else {
				sortVar = newVar;
				sortData("top");
			}
		})
		.text("row");

} // end of explore



myData = ```jsonData''';
explore(myData);


