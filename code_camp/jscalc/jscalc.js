/*global window, document */
"use strict";

var displayLine = [],
    calcLine = [],
    els;


document.getElementById("error-message").style.visibility = "hidden";

function resetLine(){
  displayLine = [];
  calcLine = [];
  document.getElementById("calc-line").innerHTML = '';
  document.getElementById("error-message").style.visibility = "hidden";
}

function updateLine(){
  document.getElementById("calc-line").innerHTML = displayLine.join('');
}

function closePowerParentheses() {
  var i,
      j,
      pow = 'Math.pow(';
  //Math.pow( currently marks end, must serach forwards for start and enclose term
  for (i = calcLine.length-1; i>=0; i--){
    if (calcLine[i] === pow) {
      calcLine[i] = ', 2)';
      for (j=i-1; j>=0; j--){
        if (!calcLine[j].toString().match(/[0-9.)]/)) {
          calcLine[j] = calcLine[j] + pow;
          break;
        } else if (j===0){
          calcLine[j] = pow + calcLine[j];
        }
      }
    }
  }
}

function closeSquareRootParentheses() {
  var i,
      j,
      sqrt = 'Math.sqrt(';
  for (i = 0; i < calcLine.length; i++) {
    if (calcLine[i] === sqrt) {
      //if last item remove
      if (i === calcLine.length -1) {
        calcLine[i] = '';
      } else if (calcLine[i+1] === 'Math.pow(') {
        //if next term if Math.pow(, remove both
        calcLine[i] = '';
        calcLine[i+1] = '';
      } else {
        for(j=i+1; j<calcLine.length; j++){
          if (!calcLine[j].toString().match(/[0-9.(]/)) {
            calcLine[j] = ')' + calcLine[j];
            break;
          } else if (j===calcLine.length-1){
            calcLine[j] = calcLine[j] + ')';
          }
        }
      }
    }
  }
}

function compute() {
  var line,
      result,
      wrapperDiv,
      lineDiv,
      resultDiv;
  closeSquareRootParentheses();
  closePowerParentheses();
  line = calcLine.join('');
  try {
    result = eval(line);
    wrapperDiv = document.createElement('div');
    lineDiv = document.createElement('div');
    lineDiv.className = "history-line";
    lineDiv.innerHTML = displayLine.join('');
    resultDiv = document.createElement('div');
    resultDiv.className = "history-result";
    resultDiv.innerHTML = '=' + result;
    wrapperDiv.appendChild(lineDiv);
    wrapperDiv.appendChild(resultDiv);
    document.getElementById("history-div").appendChild(wrapperDiv);
    
    displayLine = [];
    displayLine.push(result);
    calcLine = [];
    calcLine.push(result);
    updateLine();
  } catch(err) {
    document.getElementById("error-message").style.visibility = "visible";
    //console.log(err);
  }
}

function undoLast(){
  calcLine.pop();
  displayLine.pop();
  updateLine();
}

function addItem(key, value){
  displayLine.push(key);
  calcLine.push(value);
  updateLine();
}

function handleKey(classList){
  if (classList.contains('delete')) {
    undoLast();
  } else if (classList.contains('clear')) {
    resetLine();
  }
  else if (classList.contains('equals')) {
    compute();
  } else {
    //check for additions to the expression
    if (classList.contains('divide')){
      addItem('&divide;', '/');
    } else if (classList.contains('times')){
      addItem('&times;', '*');
    } else if (classList.contains('minus')){
      addItem('&minus;', '-');
    } else if (classList.contains('square')){
      addItem('&#178;', 'Math.pow(');
    } else if (classList.contains('sqroot')){
      addItem('&radic;', 'Math.sqrt(');
    } else if (classList.contains('percent')){
      addItem('&percnt;', '*100');
    } else if (classList.contains('plus')){
      addItem('&plus;', '+');
    }
  }
}

//set up event handlers for calculator keys
els = document.getElementsByClassName("key");
if (els) {
  Array.prototype.forEach.call(els, function(el) {
    el.addEventListener('click', function() {
      if (el.dataset && el.dataset.key) {
        addItem(el.dataset.key, el.dataset.key);
      } else {
        handleKey(el.classList);
      }
    });
  });
}

//event handler for keyboard input
document.onkeydown = function(evt) {
  evt = evt || window.event;

  if (evt.ctrlKey) {
    //Ctrl and 2, r & z used
    switch (evt.keyCode) {
      case 90:
        undoLast();
        break;
      case 82:
        //Ctrl-R is refresh page, so prevent firing
        evt.preventDefault();
        evt.stopPropagation();
        addItem('&radic;', 'Math.sqrt(');
        break;
      case 50:
        addItem('&#178;', 'Math.pow(');
        break;
    }
  } else if (evt.shiftKey) {
    //*, +, %, (, )
    switch (evt.keyCode) {
      case 56:
        addItem('&times;', '*');
        break;
      case 187:
        addItem('&plus;', '+');
        break;
      case 53:
        addItem('&percnt;', '*100');
        break;
      case 57:
        addItem('(', '(');
        break;
      case 48:
        addItem(')', ')');
        break;
    }
  } else {
    switch (evt.keyCode) {
      case 27:
        resetLine();
        break;
      case 48:
      case 96:
        addItem(0, 0);
        break;
      case 49:
      case 97:
        addItem(1, 1);
        break;
      case 50:
      case 98:
        addItem(2, 2);
        break;
      case 51:
      case 99:
        addItem(3, 3);
        break;
      case 52:
      case 100:
        addItem(4, 4);
        break;
      case 53:
      case 101:
        addItem(5, 5);
        break;
      case 54:
      case 102:
        addItem(6, 6);
        break;
      case 55:
      case 103:
        addItem(7, 7);
        break;
      case 56:
      case 104:
        addItem(8, 8);
        break;
      case 57:
      case 105:
        addItem(9, 9);
        break;
      case 110:
      case 190:
        addItem('.', '.');
        break;
      case 109:
      case 189:
        addItem('&minus;', '-');
        break;
      case 191:
        addItem('&divide;', '/');
        break;
      case 187:
        compute();
        break;
    }
  }
};
