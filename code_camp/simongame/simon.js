/*global jQuery, setTimeout, clearTimeout */
(function($) {
  'use strict';

  var game = {
    on: false,
    playing: false,
    playerTurn: false,
    playerTimeoutId: null,
    strictMode: false,
    code: [],
    playerSelection: [],
    playerIdx: -1,
    idx: -1,
    delay: 1200,
    winDisplayCount: 0,
    gameMaxIdx: 19
  };

  function clearPlayerTimeout() {
    if (game.playerTimeoutId) {
      clearTimeout(game.playerTimeoutId);
    }
    game.playerTimeoutId = null;
  }

  function switchOffGame() {
    if (game.playerTimeoutId) {
      clearPlayerTimeout();
    }
    $('#strict-mode').removeClass('active');
    $('#off, #on').toggleClass('active');
    $('.control').toggleClass('gameon');
    $('.gamestatus > div').removeClass('active').html('-').parent().removeClass('active');
    game.on = false;
  }

  function playerError() {
    $('.segment').removeClass('highlight');
    game.playerTurn = false;
    if (!game.strictMode) {
      setTimeout(beginPlayback, 1000);
    }
  }

  function displayError() {
    $('.segment').removeClass('active').addClass('disable');
    if (!game.on) {
      return;
    }
    $('.gamestatus > div').html('!');
    if (game.playerIdx) {
      $('#seg' + game.playerSelection[game.playerIdx]).addClass('highlight');
    }
    $('#erroraudio')[0].play();
  }

  function playerTimeout() {
    game.playerTimeoutId = null;
    game.playerIdx = null;
    displayError();
  }

  function setPlayerTimeout() {
    clearPlayerTimeout();
    game.playerTimeoutId = setTimeout(playerTimeout, 6000);
  }

  function playerWins() {
    var i;
    clearPlayerTimeout();
    if (!game.on) {
      switchOffGame();
      return;
    }
    game.playing = false;
    $('.segment').removeClass('highlight');
    $('.gamestatus > div').removeClass('active');
    $('.gamestatus > div').html('W');
    if (game.winDisplayCount < 8){
      game.winDisplayCount += 1;
      if (game.winDisplayCount%2) {
        $('.segment').addClass('highlight');
        $('.gamestatus > div').addClass('active');
      } 
      if (game.winDisplayCount>4){
        i = game.winDisplayCount - 4;
      } else {
        i = game.winDisplayCount;
      }
      $('#audioseg'+i)[0].play();
      game.playerTimeoutId = setTimeout(playerWins, 300);
    } else {
      $('.segment').removeClass('highlight');
      $('.gamestatus > div').addClass('active');
    }
  }
  
  function playItem() {
    var seg;
    if (game.playerTurn) {
      if (game.playerIdx >= game.playerSelection.length) {
        return;
      }
      seg = game.playerSelection[game.playerIdx];
    } else {
      if (game.idx >= game.code.length){
        return;
      }
      seg = game.code[game.idx];
    }
    $('#seg' + seg).addClass('highlight');
    $('#audioseg' + seg)[0].play();
  }

  function addItem() {
    var num = Math.floor(Math.random() * 4) + 1;
    game.code.push(num);
  }

  function nextItem() {
    $('.segment').removeClass('highlight');
    if (!game.playing || !game.on) {
      return;
    }
    if (game.playerTurn) {
      if (game.playerSelection[game.playerIdx] !== game.code[game.playerIdx]) {
        game.playerTurn = false;
        displayError();
      } else {
        if (game.playerIdx === game.gameMaxIdx) {
          playerWins();
        } else {
          game.playerIdx += 1;
          if (game.playerIdx >= game.code.length) {
            addItem();
            beginPlayback();
          }
          else if (game.playerIdx < game.playerSelection.length) {
            playItem();
          }
        }
      }
    } else {
      game.idx += 1;
      if (game.idx < game.code.length) {
        setTimeout(playItem, game.delay);
      } else {
        game.playerTurn = true;
        game.playerIdx = 0;
        $('.segment').removeClass('disable').addClass('active');
        setPlayerTimeout();
      }
    }
  }

  function beginPlayback() {
    var turn = game.code.length;
    $('.segment').removeClass('highlight');
    if (game.code.length === 0){
      return;
    } else if (game.code.length < 5) {
      game.delay = 700;
    } else if (game.code.length < 9) {
      game.delay = 500;
    } else if (game.code.length < 13) {
      game.delay = 300;
    } else {
      game.delay = 120;
    }
    $('.gamestatus > div:nth-child(2)').html(turn%10);
    $('.gamestatus > div:nth-child(1)').html(Math.floor(turn/10));
    game.playerTurn = false;
    game.playerSelection = [];
    game.playerIdx = -1;
    clearPlayerTimeout();
    game.idx = 0;
    $('.segment').removeClass('active').addClass('disable');
    setTimeout(function() {playItem();}, game.delay);
  }

  function beginGame() {
    if (game.on) {
      clearPlayerTimeout();
      game.code = [];
      game.playerSelection = [];
      game.strictMode = $('#strict-mode').hasClass('active');
      game.playing = true;
      game.winDisplayCount = 0;
      $('.gamestatus > div').html('|');
      $('.segment').addClass('highlight');
      addItem();
      setTimeout(beginPlayback, 1500);
    }
  }

  function onOff($button) {
    if ($button.hasClass('active')){
      return;
    }
    if ($button.attr('id') === 'on') {
      game.on = true;
      $('#off, #on').toggleClass('active');
      $('.gamestatus > div').addClass('active').parent().addClass('active');
      $('.control').toggleClass('gameon');
    } else {
      game.on = false;
      switchOffGame();
    }
  }

  function toggleStrictMode() {
    if ( game.on) {
      $('#strict-mode').toggleClass('active');
      game.strictMode = $('#strict-mode').hasClass('active');
    }
  }

  $('audio.seg').on('ended', nextItem);
  $('#erroraudio').on('ended', playerError);
  $('.segment').on('click', function () { 
    if (game.playerTurn) {
      clearPlayerTimeout();
      game.playerSelection.push($(this).data('segment'));
      if (game.playerIdx < game.playerSelection.length) {
        playItem();
      }
      setPlayerTimeout();
    }
  });
  $('#on, #off').on('click', function() { onOff($(this)); });
  $('#strict-mode').on('click', toggleStrictMode) ;
  $('#start-game').on('click', beginGame);

}(jQuery));