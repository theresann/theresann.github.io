// SVG drawing area

var margin2 = {top: 30, right: 40, bottom: 60, left: 60};

var width2 = 1000 - margin2.left - margin2.right,
    height2 = 350 - margin2.top - margin2.bottom;

var svg2 = d3.select("#state-grades").append("svg")
    .attr("width", width2 + margin2.left + margin2.right)
    .attr("height", height2 + margin2.top + margin2.bottom)
    .append("g")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

/* Initialize tooltip */
var score_tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10,0])
    .html(function(d) {
        return d.state + "<br> Rate of gun deaths: " + d.death_rate + "<br>Gun regulation score: " + d.grade;
    });

queue()
    .defer(d3.csv, "data/gunlaws.csv")
    .defer(d3.csv, "data/gundeaths.csv")
    .await(gunScoreVis);

function gunScoreVis() {
    var grades = arguments[1];
    var deaths = arguments[2];

    var band_padding = 3,
        band_width = width2/grades.length;

    var death_rates = {};
    deaths.forEach(function(d) {
        death_rates[d.STATE] = +d.RATE;
    })

    var data = [];

    grades.forEach(function(d) {
        var obj = {};
        obj.state = d.state;
        obj.grade = d.grade;
        obj.rank = +d.rank;
        obj.death_rate = death_rates[obj.state];
        obj.bg_checks = d.background_checks;
        data.push(obj);
    });

    data.sort(function (a, b) {return a.death_rate - b.death_rate;});

    var scoreScale = d3.scaleLinear()
        .domain([0,25])
        .range([height2, 0]).nice();



    console.log(data);

    svg2.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .on('mouseover', score_tip.show)
        .on('mouseout', score_tip.hide)
        .attr("fill", function(d) {
            console.log(d.state);
            var g = d.grade;
            if (g.includes("A")) {
                // return "#fed976";
                return "#fee5d9";
            }
            else if (g.includes("B")) {
                return "#fcae91";
            }
            else if (g.includes("C")) {
                return "#fb6a4a";
            }
            else if (g.includes("D")) {
                return "#de2d26";
            }
            else {
                return "#a50f15";
            }

        })
        .attr("width", band_width - band_padding)
        .attr("height", function(d) {return height2 - scoreScale(d.death_rate);})
        .style("stroke", "black")
        .attr("x", function (d, i) {
            return i * band_width + 5;
        })
        .attr("y", function (d) {
            return scoreScale(d.death_rate);
        });

    svg2.call(score_tip);

    svg2.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("x", function (d, i) { return i* band_width;})
        .attr("y", height2 + 15)
        .style("font-size", 10)
        .text(function(d) { return d.state;})

    svg2.append("line")
        .attr("stroke", "white")
        .attr("x1", 0)
        .attr("y1", height2)
        .attr("x2", width2 + 5)
        .attr("y2", height2);

    var yAxis2 = d3.axisLeft()
        .scale(scoreScale);

    svg2.append("g")
        .attr("class", "y axis")
        .call(yAxis2)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("(per 100,000)");

    svg2.append("text")
        .attr("text-anchor", "middle")
        .style("font-size", 14)
        .attr("transform", "translate(-" + (margin2.left/2)+ ","+(height2/2)+")rotate(-90)")
        .text("Rate of Gun Deaths");

    svg2.append("text")
        .attr("text-anchor", "middle")
        .style("font-size", 14)
        .attr("transform", "translate("+ (width2/2) +","+(height2 + margin2.bottom/2 + 5)+")")
        .text("State");

    var colorScale = {
        A: "#fee5d9",
        B: "#fcae91",
        C: "#fb6a4a",
        D: "#de2d26",
        F: "#a50f15"

    };




    (Object.keys(colorScale)).forEach(function(d, i){
        svg2.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", colorScale[d])
            .style("stroke", colorScale[d])
            .attr("x", i * 40 + 60 + 30)
            .attr("y", 5);

        svg2.append("text")
            .attr("x", i * 40 + 60 + 15 + 30)
            .attr("y", 13)
            .style("font-size", 10)
            .text(d);
    });

    svg2.append("rect")
        .attr("height", 20)
        .attr("width", 210)
        .attr("fill", "none")
        .attr("stroke-width", "0.75px")
        .attr("x", 40 + 35)
        .attr("y", 0);

    svg2.append("text")
        .attr("x", 75)
        .attr("y", -5)
        .attr("text-anchor", "start")
        .style("font-size", 12)
        .text("Gun Regulation Score Ranges")






}