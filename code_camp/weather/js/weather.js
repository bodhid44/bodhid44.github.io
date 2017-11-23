/*global jQuery, navigator */
(function($) {
  'use strict';
  var tempUnits = "°C",
      cities = {
        'london-uk': {
          description: 'London, UK',
          coords: {latitude: 51.5073509,
            longitude: -0.1277583}
        },
        'manchester-uk': {
          description: 'Manchester, UK',
          coords: {latitude: 53.4807593,
            longitude: -2.2426305},
          isDefault: true
        },
        'kyoto-jp': {
          description: 'Kyoto, Japan',
          coords: {latitude: 35.0116363,
            longitude: 135.7680294}
        },
        'san-francisco-us': {
          description: 'San Francisco, USA',
          coords: {latitude: 37.7749295,
            longitude: -122.4194155}
        },
        'rome-it': {
          description: 'Rome, Italy',
          coords: {latitude: 41.9027835,
            longitude: 12.4963655}
        },
        'new-york-us': {
          description: 'New York, USA',
          coords: {latitude:  40.7127753,
            longitude:  -74.0059728}
        }
      },
      arr = [], 
      key, 
      city
  ;

  $('#failed-msg').hide();

  function render(props) {
    return function(tok, i) { return (i % 2) ? props[tok] : tok; };
  }

  function decimalRound(value, exp){
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math.round(value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (value === null || isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // If the value is negative...
    if (value < 0) {
      return -decimalRound(-value, exp);
    }
    // Shift
    value = value.toString().split('e');
    value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));

  }

  function decDegreeToDegreeMin(decDegree){
    var abs, deg, min;
    abs = Math.abs(decDegree);
    deg = Math.floor(abs);
    min = Math.round((abs-deg) * 60);
    return deg + "°" + min + "'";
  }

//  function initMap($map, location){
//    var myOptions = {
//      center: new google.maps.LatLng( location.latitude, location.longitude ),
//      zoom: 10
//    },
//        drawingManager = new google.maps.drawing.DrawingManager(),
//        map = new google.maps.Map( $map[0], myOptions );
//
//    drawingManager.setMap( map );
//  }

  function displayWeather(data, loc){
    var segTemplate = $('script[data-template="weathersegment"]').text().split(/\$\{(.+?)\}/g),
        //addedMap,
        tod,
        sunrise,
        sunset,
        now = new Date();

    loc.clouds = data.weather[0].description + ' (' +data.clouds.all + "%)";
    loc.weather = data.weather[0].main;
    if (tempUnits === "°C") {
      loc.temperature = Math.round(data.main.temp);
    } else {
      loc.temperature = Math.round((data.main.temp * 1.8) + 32);
    }
    loc.temperature += tempUnits;
    sunrise = new Date(data.sys.sunrise * 1000);
    sunset = new Date(data.sys.sunset * 1000);
    if (now > sunrise && now < sunset){
      tod = 'day';
    } else {
      tod = 'night';
    }
    loc.weatherIcon = 'wi wi-owm-' + tod + '-' + data.weather[0].id;
    loc.sunrise = sunrise.toLocaleTimeString();
    loc.sunset = sunset.toLocaleTimeString();
    loc.humidity = data.main.humidity+ "%";
    loc.wind = data.wind.speed + 'm/s'; 
    loc.windIcon = 'wi wi-wind from-' + data.wind.deg + '-deg';
    $(segTemplate.map(render(loc)).join('')).appendTo('#main-container');
    $('#action-msg').hide();
  }

  function getWeather(loc){
    var locDisplay;
    if (!loc || !loc.latitude || !loc.longitude){
      return;
    }
    locDisplay = loc.description + ' [' + loc.latLonDisplay + ']';
    $('#action-text').text("Getting the weather for " + locDisplay);
    $('#action-msg').show();
    $.ajax({
      dataType: 'json',
      url: 'https://fcc-weather-api.glitch.me/api/current?lon=' + loc.longitude + '&lat=' + loc.latitude,
      success: function (data) {
        displayWeather(data, loc);
      }
    });
  }

  function createLocation(position){
    var location = {}, ns, ew;
    location.description = position.description;
    location.latitude  = decimalRound(position.coords.latitude, -2);
    location.longitude = decimalRound(position.coords.longitude, -2);

    if (location.latitude > 0){
      ns = 'N';
    } else if (location.latitude < 0) {
      ns = 'S';
    } else {
      ns = '';
    }
    if (location.longitude > 0){
      ew = 'E';
    } else if (location.longitude < 0) {
      ew = 'W';
    } else {
      ew = '';
    }
    location.latLonDisplay = decDegreeToDegreeMin(location.latitude) + ns + ' ' + decDegreeToDegreeMin(location.longitude)+ew;
    return location;
  }

  function getLocation(){
    if (!navigator.geolocation){
      $('#failed-msg').show();
      $('#action-msg').hide();
      return;
    }

    function success(position) {
      var location;
      position.description = "Your Location";
      location = createLocation(position);
      getWeather(location);
    }

    function error(err) {
      $('#failed-msg').show();
      $('#action-msg').hide();
      console.log(`ERROR(${err.code}): ${err.message}`);
    }

    navigator.geolocation.getCurrentPosition(success, error, {timeout:10000});
  }

  getLocation();

  for(key in cities){
    city = {name: cities[key].description, value: key};
    if (cities[key].hasOwnProperty('isDefault')){
      city.selected = true;
    }
    arr.push(city);
  }
  $('.ui.dropdown')
  .dropdown({
    values: arr
  });
  
  $('#add-weather').on('click', function(){
    var location = createLocation(cities[$('.ui.dropdown.location').dropdown('get value')]);
    getWeather(location);
  });
  
  $('#set-temp-units').on('click', function(){
    var units = $(this).text(), convert;
    if (units === tempUnits){
      return;
    }
    if (units === '°F') {
      convert = function(temp) { return Math.round((temp * 1.8) + 32); };
    } else {
      convert = function(temp) { return Math.round((temp - 32) * 5 / 9); };
    }
    $('.temperature').each( function() {
      var temp = $(this).text();
      temp = temp.substr(0, temp.indexOf('°'));
      $(this).text( convert(temp) + units);
    });
    $(this).html('<i class="right arrow icon"></i>' + tempUnits);
    tempUnits = units;
    
  });

}(jQuery));