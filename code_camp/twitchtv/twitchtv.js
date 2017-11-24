/*global jQuery */
(function($) {
  'use strict';
  var users = [
        "freecodecamp", 
        "ESL_SC2", 
        "OgamingSC2", 
        "cretetion", 
        "adrive", 
        "habathcx", 
        "RobotCaleb", 
        "noobs2ninjas"
      ],
      filter = 'all';

  function getTwitchData(user){
    var urlFront = 'https://wind-bow.gomix.me/twitch-api/';
    $.getJSON(urlFront + 'streams/' + user + '?callback=?', function(sdata) {
      $.getJSON(urlFront + 'channels/' + user + '?callback=?', function(cdata) {
        var info = {
          statusClass: 'offline',
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
          info.statusClass = 'online';
          info.icon = 'check circle outline green icon';
          info.status = sdata.stream.channel.status;
        }
        info.logo = cdata.logo;
        info.name = cdata.display_name;
        info.link = cdata.url;
        itemHtml =     '<a class="item ' + info.statusClass + '"href="'+ info.link + '" target="_blank"><div class="ui tiny image"><img src="' + info.logo + '"></div><div class="content"><div class="header"><i class="' + info.icon +'"></i>&nbsp;' + info.name + '</div><div class="description"><p>' + info.status + '</p></div></div</a>';
        $(itemHtml).appendTo('#items-div');
        if (users.indexOf(user) === -1){
          users.push(user);
        }
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
  
  $('#refresh-button').on('click', function () {
    redisplayChannels();
  });
  
  $('#add-channel-button').on('click', function () {
    var user = $('#add-channel-name').val().trim();
    if (user.length > 0) {
      getTwitchData(user);
      $('#add-channel-name').val('');
    }
  });
  
  redisplayChannels();
  

}(jQuery));