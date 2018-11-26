var dateParser = d3.timeParse("%Y-%m-%d");

queue()
    .defer(d3.csv,"data/mass_shootings.csv")
    .await(createVis);

var weapon_deaths;


function createVis(error, mass_shootings_data) {

    var massShootings = new MassShootingsVis("mass-shootings", mass_shootings_data);

   weapon_deaths = {
       "other-firearm": 70,
       "revolver": 117,
        "rifle": 421,
        "semiautomatic-handgun": 527,
        "semiautomatic-rifle": 73,
        "shotgun": 205}


    var animate_numbers = function() {
        $('.count').each(function () {
            // $(this).css('visibility', 'visible');
            $(this).prop('Counter',0).animate({
                Counter: weapon_deaths[$(this).attr('id')]
            }, {
                duration: 4000,
                easing: 'swing',
                step: function (now) {
                    $(this).text(Math.ceil(now));
                }
            });
        });
    }


    // $(window).scroll(function() {
    //     var hT = $('#mass-shootings2').offset().top,
    //         hH = $('#mass-shootings2').outerHeight(),
    //         wH = $(window).height(),
    //         wS = $(this).scrollTop();
    //     if (wS === (hT+hH-wH)){
    //         setTimeout(animate_numbers, 5000)
    //     }
    // });

    // $('.col-4').click( function (e) {
    //     if ( e.target === this ) {
    //         animate_numbers();
    //     }
    // });

}

var animate_numbers = function() {
    $('.count').each(function () {
        // $(this).css('visibility', 'visible');
        $(this).prop('Counter',0).animate({
            Counter: weapon_deaths[$(this).attr('id')]
        }, {
            duration: 20* weapon_deaths[$(this).attr('id')],
            easing: 'swing',
            step: function (now) {
                $(this).text(Math.ceil(now));
            }
        });
    });
}

function weaponsAnimate () {
    $('#showGrid').css('display', 'none');
    $('.col-4').each(function() {
        $(this).fadeIn();

    })
    animate_numbers();
}



function massShootingsWeapons() {
    $('#showGrid').css('display', 'none');
    $('.col-4').each(function(index) {
        $(this).delay(600*index).css("visibility", "visible");
    })
    // animate_numbers();
}