/* Draws a scatter plot showing the correlation between gun ownership
* and the number of gun deaths*/

// SVG drawing area
var regression;

var regions = ["Northeast", "West", "Midwest", "South"];
var colors = ["blue", "green", "yellow", "red"];

var overlaps = ["IL", "PA", "NE", "IN", "AZ", "MI", "NC", "MT", "WY", "OH", "UT"];

console.log(overlaps);

var margin = {top: 30, right: 40, bottom: 70, left: 70};

var width = 900 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

var svg = d3.select("#gun-ownership").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function int(x) {
    return parseFloat(x.replace(/,/g, ''));
}

// x axis shows gun ownership in adults
// y axis shows gun deaths per 100,000 people, from 2016
var x = d3.scaleLinear()
    .range([0,width]);

var y = d3.scaleLinear()
    .range([height, 0]);

/* Initialize tooltip */
var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10,0])
    .html(function(d) {
        return d.name + "<br> Gun ownership: " + d.owners + "&#37; <br> Rate of gun deaths: "
            + d.death_rate;
    });


queue()
    .defer(d3.csv, "data/gunownership.csv")
    .defer(d3.csv, "data/gundeaths.csv")
    .defer(d3.csv, "data/gunlaws.csv")
    .await(gunOwnersVis);



function gunOwnersVis() {

    var ownership = arguments[1];
    var deaths = arguments[2];
    var laws = arguments[3];


    console.log(laws);

    var combined = {};

    ownership.forEach(function(d) {
        // d.gun_ownership = +d.gun_ownership;
        combined[d.abbrev] = {
            name: d.state,
            owners: +d.gun_ownership,
            abbrev: d.abbrev,
            region: d.region
        };
    });


    deaths.forEach(function(d){
        combined[d.STATE].deaths = int(d.DEATHS);
        combined[d.STATE].death_rate = +d.RATE;
    });

    laws.forEach(function(d) {
        combined[d.state].background_checks = d.background_checks;
    });

    var data = [];
    var x_values = [];
    var y_values =[];

    var ix = 0;
    for (var key in combined) {
        data[ix] = combined[key];
        x_values[ix] = data[ix].owners;
        y_values[ix] = data[ix].death_rate;
        ix++;
    }

    console.log(data);


    max_ownership = d3.max(data, function(x){ return x.owners; });
    x.domain([0, max_ownership + 5]);

    max_deaths = d3.max(data, function(x){ return x.death_rate; });
    y.domain([0, max_deaths]);


    var points = svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .attr("fill", function(d) {
            if (d.background_checks === "no") {
                return "red";
            }
            else {
                return "white";
            }
        })
        .attr("opacity", 0.5)
        // .attr("fill", "transparent")
        // .style("stroke-width", "1.5px")
        .style("stroke", "none")
        .attr("r", 6)
        .attr("cx", function(d){
            return x(d.owners); })
        .attr("cy", function(d) {
            return y(d.death_rate); });

    var labels = svg.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .attr("class", "point-label")
        .style("stroke", function(d) {
            if (d.background_checks === "no") {
                return "#a50f15";
            }
            else {
                return "white";
            }
        })
        .style("font-style", "italic")
        .style("font-size", 8)
        .style("font-weight", "lighter")
        .attr("x", function(d){
            if (overlaps.indexOf(d.abbrev) > -1) {
                return x(d.owners) - 15;
            }
            else {
                return x(d.owners);
            } })
        .attr("y", function(d) {
            if (overlaps.indexOf(d.abbrev) > -1) {
                return y(d.death_rate) - 7;
            }
            else {
                return y(d.death_rate) + 15;
            }
        })
        .text(function(d){return d.abbrev; });

    svg.call(tip);

    var xAxis = d3.axisBottom()
        .scale(x);

    var yAxis = d3.axisLeft()
        .scale(y);


    // legend

    svg.append("circle")
        .style("stroke", "none")
        .attr("fill", "red")
        .attr("opacity", 0.5)
        .attr("cx", width - 125)
        .attr("cy", height - 80)
        .attr("r", 6);

    svg.append("text")
        .attr("fill", "#a50f15")
        .attr("x", 15 + width - 125)
        .attr("y", height - 80 + 3)
        .style("font-size", 10)
        .text("no background checks");

    svg.append("circle")
        .style("stroke", "none")
        .attr("opacity", 0.5)
        .attr("fill", "white")
        .attr("cx", width - 125)
        .attr("cy", height - 80 + 20)
        .attr("r", 5);

    svg.append("text")
        .attr("fill", "white")
        .style("font-size", 10)
        .attr("x", 15 + width - 125)
        .attr("y", height - 80 + 20 + 3)
        .text("background checks");

    svg.append("rect")
        .attr("x", width - 140)
        .attr("y", height - 95)
        .attr("fill", "none")
        .attr("stroke-width", "0.75px")
        .attr("height", 50)
        .attr("width", 150);


    //x axis
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("(% of population)");

    svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("(per 100,000 people)");

    // axis labels
    svg.append("text")
        .attr("text-anchor", "middle")
        .style("font-size", 14)
        .attr("transform", "translate(-" + (margin.left/2)+ ","+(height/2)+")rotate(-90)")
        .text("Rate of Gun Deaths");

    svg.append("text")
        .attr("text-anchor", "middle")
        .style("font-size", 14)
        .attr("transform", "translate("+ (width/2) +","+(height + margin.bottom/2 + 5)+")")
        .text("Gun Ownership");


}





