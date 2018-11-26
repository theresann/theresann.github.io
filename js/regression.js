function calcLinear(data, x, y, minX, minY) {
    /////////
    //SLOPE//
    /////////

    // Let n = the number of data points
    var n = data.length;

    // Get just the points
    var pts = [];
    data.forEach(function (d, i) {
        var obj = {};
        obj.x = d[x];
        obj.y = d[y];
        obj.mult = obj.x * obj.y;
        pts.push(obj);
    });

    // Let a equal n times the summation of all x-values multiplied by their corresponding y-values
    // Let b equal the sum of all x-values times the sum of all y-values
    // Let c equal n times the sum of all squared x-values
    // Let d equal the squared sum of all x-values
    var sum = 0;
    var xSum = 0;
    var ySum = 0;
    var sumSq = 0;
    pts.forEach(function (pt) {
        sum = sum + pt.mult;
        xSum = xSum + pt.x;
        ySum = ySum + pt.y;
        sumSq = sumSq + (pt.x * pt.x);
    });
    var a = sum * n;
    var b = xSum * ySum;
    var c = sumSq * n;
    var d = xSum * xSum;

    // Plug the values that you calculated for a, b, c, and d into the following equation to calculate the slope
    // slope = m = (a - b) / (c - d)
    var m = (a - b) / (c - d);

    /////////////
    //INTERCEPT//
    /////////////

    // Let e equal the sum of all y-values
    var e = ySum;

    // Let f equal the slope times the sum of all x-values
    var f = m * xSum;

    // Plug the values you have calculated for e and f into the following equation for the y-intercept
    // y-intercept = b = (e - f) / n
    var b = (e - f) / n;

    // Print the equation below the chart
    document.getElementsByClassName("equation")[0].innerHTML = "y = " + m + "x + " + b;
    document.getElementsByClassName("equation")[1].innerHTML = "x = ( y - " + b + " ) / " + m;

    // return an object of two points
    // each point is an object with an x and y coordinate
    return {
        ptA: {
            x: minX,
            y: m * minX + b
        },
        ptB: {
            y: minY,
            x: (minY - b) / m
        }
    }
}