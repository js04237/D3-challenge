var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.9,
      d3.max(censusData, d => d[chosenXAxis]) * 1.1
    ])
    .range([0, width]);

  return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(censusData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.9,
      d3.max(censusData, d => d[chosenYAxis]) * 1.1
      ])
      .range([height, 0]);
  
    return yLinearScale;
  }

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
}

// function used for updating circles group with a transition
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function used for updating circle text with a transition
function renderXText(circlesText, newXScale, chosenXAxis) {

  circlesText.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));

  return circlesText;
}

function renderYText(circlesText, newYScale, chosenYAxis) {

  circlesText.transition()
    .duration(1000)
    .attr("y", d => newYScale(d[chosenYAxis]));

  return circlesText;
}

// // function used for updating circles group with new tooltip
function updateToolTip(circlesText, chosenXAxis, chosenYAxis) {

  var xlabel;

  if (chosenXAxis === "poverty") {
    xlabel = "Poverty Rate (%): ";
  }
  else if (chosenXAxis === "age") {
   xlabel = "Median Age (yrs): ";
  }
  else if (chosenXAxis === "income") {
    xlabel = "Income (USD): ";
  }

  var ylabel;

  if (chosenYAxis == "smokes") {
    ylabel = "% Smokers:";
  }
  else if (chosenYAxis == "obesity") {
   ylabel = "Obesity Rate (%): ";
  }
  else if (chosenYAxis == "healthcare") {
    ylabel = "% Lacking Healthcare: ";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-20, 0])
    .html(function(d) {
      return (`${xlabel}${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}`);
    });
  
  circlesText.call(toolTip);
  
  circlesText.on("mouseover", function(data) {
    toolTip.show(data),
    d3.select(this).style("fill", "black")
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
      d3.select(this).style("fill", "#fff")
      
    });
  
  return circlesText;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(censusData, err) {
  if (err) throw err;

  // parse data
  censusData.forEach(function(data) {
    data.name = data.state;
    data.abbr = data.abbr;
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
    data.healthcare = +data.healthcare;
  });
  // xLinearScale function above csv import
  var xLinearScale = xScale(censusData, chosenXAxis);

  // yLinearScale function above csv import
  var yLinearScale = yScale(censusData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // Create nodes for the data points
  var node = chartGroup.selectAll("g")
    .data(censusData)
    .enter()
    .append("g")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))

  // append initial circles
  var circlesGroup = node.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .attr("class", "stateCircle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 14)
    // this seems to slow down the transition, but makes it slightly easier to read when circles overlay one another
    // .attr("opacity", "0.0350");
  
  var circlesText = node.selectAll("text")
    .data(censusData)
    .enter()
    .append("text")
    .attr("class", "stateText")
    // .attr("text-anchor", "middle") // centers the text but is slightly off center on y-axis, included as part of d3Style.css
    .attr("dy", ".35em") // centers the text on the y-axis
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    // .attr("fill", "white")  // included as part of d3Style.css
    .text(d => d.abbr)

  // Create group for three x-axis labels
  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  // Create group for three y-axis labels
  var yLabelsGroup = chartGroup.append("g")

  var obesityLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "obesity") // value to grab for event listener
    .classed("active", true)
    .text("Obese (%)");

  var smokesLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 20 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes(%)");

  var healthcareLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 40 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Lacks Healthcare (%)");
  
  // using node here doesn't return values as expected, not sure why values aren't stored on node
  // circlesText seems to work ok, but the area is slightly smaller
  tipData = updateToolTip(circlesText, chosenXAxis, chosenYAxis);

  // x axis labels event listener
  xLabelsGroup.selectAll("text")
    .on("click", function() {

      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(censusData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates circle text with new x values
        circlesText = renderXText(circlesText, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        var tipData = updateToolTip(circlesText, chosenXAxis, chosenYAxis);

        // changes classes to change bold text
        if (chosenXAxis == "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis == "poverty") {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis == "income") {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

  yLabelsGroup.selectAll("text")
    .on("click", function() {

      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenYAxis with value
        chosenYAxis = value;

        // functions here found above csv import
        // updates x scale for new data
        yLinearScale = yScale(censusData, chosenYAxis);

        // updates x axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new y values
        circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);

        // updates circle text with new x values
        circlesText = renderYText(circlesText, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        var tipData = updateToolTip(circlesText, chosenXAxis, chosenYAxis);

        // changes classes to change bold text
        if (chosenYAxis == "obesity") {
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis == "smokes") {
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis == "healthcare") {
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});

