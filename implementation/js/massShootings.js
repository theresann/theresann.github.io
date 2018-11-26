MassShootingsVis = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;

    this.initVis();
}

MassShootingsVis.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 40, right: 0, bottom: 60, left: 50};

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 600 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("id", "mass-shooting-svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10,0])
        .html(function(d) {
            return d.case + "<br>" + d.date + "<br>" + d.fatalities + " dead, " + d.injured + " injured";
        });

    vis.wrangleData();
}


MassShootingsVis.prototype.wrangleData = function() {
    var vis = this;

    var shooting_victims = []
    console.log(vis.data);

    var id = 0;
    vis.case_ids = {};
    var case_id_max = 0;
    vis.data.forEach(function(d){
        var day = dateParser(d.date);
        var number_killed = + d.fatalities;
        // console.log(number_killed);
        if (!(d.case in vis.case_ids)) {
            vis.case_ids[d.case] = case_id_max;
            case_id_max++;
        }
        for (var i = 0; i < number_killed; i++ ) {
            var obj = {
                id: id,
                case: d.case,
                case_id: vis.case_ids[d.case],
                date: d.date,
                fatalities: number_killed,
                injured: d.injured,
                weapon_type: d.weapon_type,
                mental_health: d.prior_signs_mental_health_issues,
                location: d.location,
                descr: d.descr
            }
            shooting_victims.push(obj);
            id ++;
        }
    });

    vis.displayData = shooting_victims;

    console.log(case_id_max);

    console.log(vis.displayData);

    vis.updateVis();
};

MassShootingsVis.prototype.updateVis = function() {
    var vis = this;

    var num_per_row = Math.ceil(vis.width / 22);
    var num_of_rows = Math.ceil(vis.displayData.length / num_per_row);

    console.log(num_per_row);

    // var half_length = Math.ceil(vis.displayData.length / 2);

    var half_length = num_per_row * Math.floor(num_of_rows / 2);


    // vis.svg.selectAll("image")
    //     .data(vis.displayData)
    //     .enter()
    //     .append("image")
    //     .attr("xlink:href", "img/man-user.svg")
    //     .style("fill", "white")
    //     .attr("width", 15)
    //     .attr("height", 15)
    //     .attr("x", function(d) {return (d.id % num_per_row) * 20})
    //     .attr("y", function(d) {
    //         if (d.id < half_length) {
    //             return Math.floor(d.id/num_per_row) * 20;
    //         }
    //         else {
    //             return Math.floor(d.id/num_per_row) * 20 + 200;
    //         }
    //
    //     });




    vis.svg.selectAll("circle")
        .data(vis.displayData)
        .enter()
        .append("circle")
        .on('mouseover', vis.tip.show)
        .on('mouseout', vis.tip.hide)
        .on('click', function(d) {
            d3.selectAll(".words").remove();

            vis.svg.append("text")
                .style("text-anchor", "middle")
                .style("font-size", 30)
                .attr("class", "words")
                .attr("x", (vis.width - vis.margin.left)/2)
                .attr("y", vis.height/2)
                .style("fill", "white")
                .text(d.case);

            var textG = vis.svg.append('g');

            var i = 0;

            var fullTxt = d.descr;

            var b = fullTxt.split('.');


            vis.svg.append("foreignObject")
                .style("text-anchor", "middle")
                .style("font-size", 14)

                .attr("class", "words")
                .attr("x", 15)
                .attr("y", vis.height/2 + 25)
                .attr("width", vis.width * 0.88)
                .style("fill", "white")
                .text(d.descr);

        })
        .attr("stroke", "black")
        .style("fill", "white")
        .attr("class", function(d) { return "shooting-case-"+d.case_id; })
        .attr("r", 7)
        .attr("cx", function(d) {return (d.id % num_per_row) * 20 + 20})
        .attr("cy", function(d) {
            if (d.id < half_length) {
                return Math.floor(d.id/num_per_row) * 20;
            }
            else {
                return Math.floor(d.id/num_per_row) * 20 + 230;
            }

        });

    vis.svg.call(vis.tip);


    var summary_info = function() {
        vis.svg.append("text")
            .style("text-anchor", "middle")
            .attr("class", "words")
            .attr("x", (vis.width - vis.margin.left)/2)
            .attr("y", vis.height/2 - 15)
            .style("fill", "white")
            .text("In mass shootings between 1982 and 2018,");

        vis.svg.append("text")
            .style("text-anchor", "middle")
            .style("font-weight", "bolder")
            .style("font-size", 60)
            .attr("class", "words")
            .attr("x", (vis.width - vis.margin.left)/2)
            .attr("y", vis.height/2 + 50)
            .style("fill", "white")
            .text("836 PEOPLE HAVE DIED");

        vis.svg.append("text")
            .style("text-anchor", "middle")
            .attr("class", "words")
            .attr("x", (vis.width - vis.margin.left)/2)
            .attr("y", vis.height/2 + 80)
            .style("fill", "white")
            .text("and thousands more have been injured.");

        vis.svg.append("text")
            .style("text-anchor", "middle")
            .style("font-size", 12)
            .style("font-style", "italic")
            .attr("class", "words")
            .attr("x", (vis.width - vis.margin.left)/2)
            .attr("y", vis.height/2 + 100 + 15)
            .style("fill", "white")
            .text("Each dot represents a person who died in a mass shooting. " +
                "Click on a dot to read about the incident in which they died.");

    }

    summary_info();


    // adapted from https://stackoverflow.com/questions/12786810/hover-on-element-and-highlight-all-elements-with-the-same-class/38501503
    Object.values(vis.case_ids).forEach(function(d){
        var elms = document.getElementsByClassName("shooting-case-"+d);
        var n = elms.length;
        function changeColor(color, width) {
            for(var i = 0; i < n; i ++) {
                elms[i].style.fill = color;
            }
        }
        for(var i = 0; i < n; i ++) {
            elms[i].onmouseover = function() {
                changeColor("orange", "3px");
            };
            elms[i].onmouseout = function() {
                changeColor("white", "0px");
            };
        }

    } );



    $('#mass-shooting-svg').click( function (e) {
        if ( e.target == this ) {
            d3.selectAll(".words").remove();
            summary_info();

        }
    });


    vis.thirdVis();

}




MassShootingsVis.prototype.secondVis = function() {
    var vis = this;

    var second_slide = d3.select("#" + vis.parentElement + "2").append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    var weapons = {
        "semiautomatic handgun": 0,
        "rifle": 0,
        "semiautomatic rifle": 0,
        "revolver": 0,
        "shotgun": 0,
        "other firearm": 0
    };

    vis.displayData.forEach(function(d) {
        var other = true;
        if (d.weapon_type.includes("semiautomatic handgun")) {
            weapons["semiautomatic handgun"]++;
            other = false;
        }
        if (d.weapon_type.includes("shotgun")) {
            weapons["shotgun"]++;
            other = false;
        }
        if (d.weapon_type.includes("rifle")) {
            weapons["rifle"]++;
            other = false;
        }
        if (d.weapon_type.includes("semiautomatic rifle")) {
            weapons["semiautomatic rifle"]++;
            other = false;
        }
        if (d.weapon_type.includes("revolver")) {
            weapons["revolver"]++;
            other = false;
        }
        if (other) {
            weapons["other firearm"]++;
        }
    });

    var t = d3.transition()
        .duration(750)
        .ease(d3.easeLinear);

    console.log(weapons);


    var weapon_deaths = function() {
        Object.keys(weapons).forEach(function(d, i){
            var x, y;
            if (i < 3) {
                y = vis.height/4;
            }
            else {
                y = 3 * vis.height/4;
            }

            if (i === 0 || i === 3) {
                x = vis.width/4;
            }
            else if (i === 1 || i === 4) {
                x = 2 * vis.width/4;
            }
            else {
                x = 3 * vis.width/4;
            }

            second_slide.append("text")
                .transition(t)
                .style("text-anchor", "middle")
                .style("font-size", 60)
                .attr("x", x)
                .attr("y", y)
                .style("fill", "white")
                .text(weapons[d])


            second_slide.append("text")
                .transition(t)
                .style("text-anchor", "middle")
                .attr("x", x)
                .attr("y", y + 20)
                .style("fill", "white")
                .text("died in an incident");
            second_slide.append("text")
                .transition(t)
                .style("text-anchor", "middle")
                .attr("x", x)
                .attr("y", y + 35)
                .style("fill", "white")
                .text("involving");
            second_slide.append("text")
                .transition(t)
                .style("text-anchor", "middle")
                .attr("x", x)
                .attr("y", y + 50)
                .style("fill", "white")
                .text(d + "s");
        })

    }

    $(window).scroll(function() {
        var hT = $('#mass-shootings2').offset().top,
            hH = $('#mass-shootings2').outerHeight(),
            wH = $(window).height(),
            wS = $(this).scrollTop();
        if (wS > (hT+hH-wH)){
            setTimeout(weapon_deaths, 5000)
        }
    });


    // vis.thirdVis();

}


MassShootingsVis.prototype.thirdVis = function() {

    var vis = this;

    var third_slide = d3.select("#" + vis.parentElement + "3").append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", 320)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + ",0)");

    var locations = {

        "Place of Worship": 0,
        "School": 0,
        "Workplace": 0,
        "Other": 0
    };

    vis.displayData.forEach(function(d) {
        // console.log(d.location);
        var place = d.location;

        if (place.includes("Workplace")) {
            locations["Workplace"]++;
        }
        else if (place.includes("Religious")) {
            locations["Place of Worship"]++;
        }
        else if (place.includes("School")) {
            locations["School"]++;
        }
        else {
            console.log(place);
            locations["Other"]++;
        }
    })

    console.log(locations);

    // var square_tip = d3.tip()
    //     .attr('class', 'd3-tip')
    //     .offset([-10,0])
    //     .html(function(d) {
    //         return d;
    //     });

    Object.keys(locations).forEach(function(d){
        var num = locations[d];
        var startY;
        if (d === "Place of Worship") {
            startY = 0;
        }
        else if (d === "School") {
            startY = 115;
        }
        else if (d === "Workplace") {
            startY = 230;
        }
        else {
            startY = 300;
        }

        if (d !== "Other") {
            d3.range(num).forEach(function(i) {
                third_slide.append("rect")
                    .attr("height", 10)
                    .attr("width", 10)
                    .attr("x", Math.floor(i/4) * 17 + 100)
                    .attr("y", startY + (i % 4) * 15);
            })
        }
    });

    function addText(y, content) {
        third_slide.append("text")
            .style("text-anchor", "start")
            // .attr("class", "words")
            .attr("x", 0 + 100)
            .attr("y", y)
            .style("stroke", "orange")
            .text(content);
    }


    setTimeout(addText(80, locations["Place of Worship"] + " people have died in a place of worship."), 1000);
    setTimeout(addText(195, locations["School"] + " people have died in a school."), 3000);
    setTimeout(addText(310, locations["Workplace"] + " people have died in a workplace."), 5000);



}
