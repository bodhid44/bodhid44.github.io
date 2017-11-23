/*global jQuery */
(function($) {
  'use strict';
  const users = [
    "freecodecamp", 
    "ESL_SC2", 
    "OgamingSC2", 
    "cretetion", 
    "storbeck", 
    "habathcx", 
    "RobotCaleb", 
    "noobs2ninjas"
  ];
  var filter = 'all';

  function getTwitchData(user){
    var urlFront = 'https://wind-bow.gomix.me/twitch-api/';
    $.getJSON(urlFront + 'streams/' + user + '?callback=?', function(sdata) {
      console.log(sdata);
      $.getJSON(urlFront + 'channels/' + user + '?callback=?', function(cdata) {
        var info = {
          class: 'offline',
          icon: 'remove circle outline red icon',
          logo: '',
          status: '',
          name: '',
          link: '#'
        }, 
        itemHtml;
        if (!cdata || cdata.error) {
          return;
        }
        
        if ( (sdata.stream && (filter === 'offline')) || (!sdata.stream && (filter === 'online')) ){
          return;
        } 
        
        if (sdata.stream) {
          info.class = 'online';
          info.icon = 'check circle outline green icon';
          info.status = sdata.stream.channel.status;
        }
        info.logo = cdata.logo;
        info.name = cdata.display_name;
        info.link = cdata.url;
        itemHtml = '<div class="item ' + info.class + '"><div class="ui tiny image"><img src="' + info.logo + '"></div><div class="content"><a class="header" href="'+ info.link + '" target="_blank"><i class="' + info.icon +'"></i>&nbsp;' + info.name + '</a><div class="description"><p>' + info.status + '</p></div></div></div>';
//        itemHtml = '<div class="item ' + info.class + '"><a class="header" href="'+ info.link + '" target="_blank"><div class="ui tiny image"><img src="' + info.logo + '"></div><div class="content"><i class="' + info.icon +'"></i>&nbsp;' + info.name + '<div class="description"><p>' + info.status + '</p></div></div></a></div>';
        $(itemHtml).appendTo('#items-div');
      });
    });
  }
  
  function redisplayChannels()  {
    $('#items-div').empty();
    users.forEach(getTwitchData);
  }

  
  $('input:radio[name=filter]').change(function () {
    filter = $('input:radio[name=filter]:checked').val();
    redisplayChannels();
  });
  
  $('button.ui.primary.icon.button').on('click', function () {
    redisplayChannels();
  });
  
  redisplayChannels();
  

}(jQuery));