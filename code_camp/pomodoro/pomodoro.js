/*global jQuery, clearInterval, setInterval, setTimeout */
(function($) {
  'use strict';

  var settings = {
    pomodoroLength: 25,
    pomodoroLengthMax: 59,
    breakLength: 5,
    breakLengthMax: 30
  },
      clock = {
        running: false,
        transitioning: false,
        type: 'Pomodoro',
        color: '#1111aa',
        pauseStart: null,
        clockStart: null,
        periodSecs: null,
        elapsedSecs: null,
        intervalID: null
      }
  ;

  //  var pomo = {tasks: [
  //    {name: 'Complete Pomodoro Project',
  //    description: 'fCC Advanced Front End Development Project',
  //    estimatedPoms: 10,
  //    consumedPoms: 1,
  //    started: '2017-11-25',
  //    completed: ''}
  //  ]};
  //  
  //  function populateStorage(key, obj){
  //    localStorage.setItem(key, JSON.stringify(obj));
  //  }
  //  pomo = JSON.parse(localStorage.getItem('pomodoro'));
  //  console.log(JSON.stringify(pomo, undefined, 2));
  //  populateStorage('pomodoro', pomo);
  //  localStorage.clear();

  //only place clock display shuld be set
  function setClockDislay(display, colour) {
    $('#clock-face').text(display).css('color', colour);
  }

  function getClockColour(elapsed, length) {
    var fractionComplete = (elapsed / length),
        r,
        g;
    if (fractionComplete > 0.5) {
      r = 255;
      g = Math.round(255 * ((1 - fractionComplete) * 2));
    } else {
      g = 255;
      r = Math.round(255 * (fractionComplete * 2));
    }
    return 'rgb(' + r + ', ' + g + ', 0)';
  }

  function initialiseClock () {
    clock.elapsedSecs = 0;
    clock.running = true;
    if (clock.type === 'Pomodoro') {
      clock.periodSecs = Number($('#pomodoroLength').text()) * 60;
    } else {
      clock.periodSecs = Number($('#breakLength').text()) * 60;
    }
    $('#clock-type').text(clock.type).css('color', clock.color);
    $('#clock-body').css('background-color', clock.color);
  }

  function clockCountdown (pause) {
    var now = new Date().getTime(),
        secSinceStart = 0,
        totalElapsedSecs,
        remainingSecs,
        display;

    if (!clock.clockStart){
      clock.clockStart = now;
    } else {
      secSinceStart = Math.round((now - clock.clockStart) / 1000);
    }
    totalElapsedSecs = clock.elapsedSecs + secSinceStart;
    if (pause) {
      clock.elapsedSecs = totalElapsedSecs;
      clock.clockStart = null;
    } 

    //check for end
    if ( totalElapsedSecs >= clock.periodSecs ) {
      clearInterval(clock.intervalID);
      clock.intervalID = null;
      clock.running = false;
      clock.clockStart = null;
      $('#alarm')[0].play();
    } 
    //set display
    remainingSecs = (clock.periodSecs - totalElapsedSecs);
    display = Math.floor(remainingSecs/60) + ":" + ('00' + (remainingSecs % 60)).slice(-2);
    setClockDislay(display, getClockColour(totalElapsedSecs, clock.periodSecs));
    //if completed, switch pomodoro <-> break and restart clock
    if (!clock.running) {
      $('#clock-type').text('Transitioning ...').css('color', '#111111');
      $('#clock-body').css('background-color', '#eee');
      clock.transitioning = true;
      setTimeout(switchMode, 8000);
    }
  }

  function switchMode(){
    if ( clock.type === 'Pomodoro') {
      clock.type = 'Break';
      clock.color = '#aa11aa';
    } else {
      clock.type = 'Pomodoro';
      clock.color = '#1111aa';
    }
    initialiseClock();
    clock.transitioning = false;
    clock.intervalID = setInterval(clockCountdown, 1000);
    clockCountdown();
  }

  function setRunningMode() {
    if (!clock.running) {
      $('.fa-plus-square, .fa-minus-square, .time-setting a').addClass('enabled');
      $('.time-setting a').attr('title', '');
      $('#clock-reset').removeClass('enabled');
    } else {
      $('.fa-plus-square, .fa-minus-square, .time-setting a').removeClass('enabled');
      $('.time-setting a').attr('title', 'Reset required');
      $('#clock-reset').addClass('enabled');
    }
  }

  function startPauseClock() {
    if (clock.transitioning) {
      return;
    }
    if (clock.intervalID) {
      //pausing
      clearInterval(clock.intervalID);
      clock.intervalID = null;
      $('#clock-type').text(clock.type + ' [Paused]').css('color', '#04B4AE');
      clockCountdown(true);
    } else {
      //starting
      if (!clock.running) {
        initialiseClock();
        setRunningMode();
      } else {
        $('#clock-type').text(clock.type).css('color', clock.color);
      }
      clock.intervalID = setInterval(clockCountdown, 1000);
      clockCountdown();
    }
  }

  function resetClock() {
    if (!clock.running) {
      return;
    }
    if (clock.intervalID) {
      clearInterval(clock.intervalID);
    }
    clock.intervalID = null;
    clock.running = false;
    clock.elapsedSecs = 0;
    clock.clockStart = null;
    clock.transitioning = false;
    clock.type = 'Pomodoro';
    clock.color = '#1111aa';
    $('#clock-type').text(clock.type).css('color', clock.color);
    $('#clock-body').css('background-color', '#eee');
    setClockDislay(settings.pomodoroLength + ':00', 'rgb(0, 255, 0)');
    setRunningMode();
  }


  //>>>>> ----- Change Pomodoro/Break Settings -----
  function changeSettings(item, value){
    if (value < 1) {
      settings[item + 'Length'] = Math.max(1, settings[item + 'Length'] + value);
    } else {
      settings[item + 'Length'] = Math.min(settings[item + 'LengthMax'], settings[item + 'Length'] + value);
    }
    //console.log(settings);
    $('#' + item + 'Length').text(settings[item + 'Length']);
    if (!clock.running && item === 'pomodoro'){
      setClockDislay(settings[item + 'Length'] + ':00', 'rgb(0, 255, 0)');
    }
  }

  $('div.pomodoro > a').on('click', function () {
    var value = 1;
    if (clock.running) {
      return;
    }
    if ( $(this).hasClass('decrease') ){
      value = -1;
    }
    changeSettings('pomodoro', value);
  });

  $('div.break > a').on('click', function () {
    var value = 1;
    if (clock.running) {
      return;
    }
    if ( $(this).hasClass('decrease') ){
      value = -1;
    }
    changeSettings('break', value);
  });
  //----- Change Pomodoro/Break Settings ----- <<<<<

  $('#clock-face').on('click', startPauseClock);
  $('#clock-type').text(clock.type).css('color', clock.color);
  $('#clock-face').css('color', 'rgb(0, 255, 0)');
  $('#clock-reset').on('click', resetClock);
}(jQuery));