/*global jQuery, setTimeout */
(function($) {
  'use strict';
  var game = {
    cells: [['','',''],['','',''],['','','']],
    status: {rows: [{x:0,o:0},{x:0,o:0},{x:0,o:0}],
             cols: [{x:0,o:0},{x:0,o:0},{x:0,o:0}],
             diags: [{x:0,o:0},{x:0,o:0}]
            },
    moves: [],
    humanMark: 'o', 
    humanMarkUrl: 'url(../images/nought-human.png)',
    computerMark: 'x',
    computerMarkUrl: 'url(../images/cross-computer.png)'
  },
      gameOver = false,
      swapMark = false,
      score = {computer:0, human:0},
      computerLevel,
      computerThinking = false,
      showmarkSelection = false,
      cornerCellNums = [1,3,7,9];

  //##### >>>>> set up dropdown <<<<< #####
  $('#computer-level')
    .dropdown({
    values: [
      {
        name: 'Average',
        value: 'average',
        selected : true
      },
      {
        name     : 'Poor',
        value    : 'poor'
      },
      {
        name     : 'Very poor',
        value    : 'vpoor'
      }
    ]
  });

  //##### >>>>> initial game display set up <<<<< #####
  $('#human-turn, #computer-turn').hide();

  // starts a new game: resets game data and clears all cells
  //changed computer level only checked on new game start
  function newGame (){
    if (swapMark){
      if (game.humanMark === 'x'){
        game.humanMark = 'o';
        game.humanMarkUrl = 'url(../images/nought-human.png)';
        game.computerMark = 'x';
        game.computerMarkUrl = 'url(../images/cross-computer.png)';
      } else {
        game.humanMark = 'x';
        game.humanMarkUrl = 'url(../images/cross-human.png)';
        game.computerMark = 'o';
        game.computerMarkUrl = 'url(../images/nought-computer.png)';
      }
    } 
    computerLevel = $('#computer-level').dropdown('get value');
    $('td').removeClass('winner').css('background-image', '');
    game.cells = [['','',''],['','',''],['','','']];
    game.status = {
      rows: [{x:0,o:0},{x:0,o:0},{x:0,o:0}],
      cols: [{x:0,o:0},{x:0,o:0},{x:0,o:0}],
      diags: [{x:0,o:0},{x:0,o:0}]
    };
    game.moves = [];
    gameOver = false;
    if (game.humanMark !== 'x') {
      $('#computer-turn').show();
      makeComputerMove();
    } else {
      $('#human-turn').show();
    }
  }

  //converts row, column to cell number (1~9) starting top left, right across row, then down each row
  function getCellNumber(r, c){
    var cellNum;
    switch (r) {
      case 0:
        switch (c) {
          case 0:
            cellNum = 1;
            break;
          case 1:
            cellNum = 2;
            break;
          default:
            cellNum = 3;
        }
        break;
      case 1:
        switch (c) {
          case 0:
            cellNum = 4;
            break;
          case 1:
            cellNum = 5;
            break;
          default:
            cellNum = 6;
        }
        break;
      default:
        switch (c) {
          case 0:
            cellNum = 7;
            break;
          case 1:
            cellNum = 8;
            break;
          default:
            cellNum = 9;
        }
    }
    return cellNum;
  }

  //update score display after win
  function updateScore(winner){
    score[winner] += 1;
    $('#'+winner+"-score").text(score[winner]);
  }

  //checks row, col or diag for the req number of marks, does both X and 0
  function checkLine (line, markCount) {
    return game.status[line].reduce( 
      function (acc, item, idx) {
        if (item.x === markCount) {
          acc.push({mark: 'x', idx: idx});
        } else if (item.o === markCount) {
          acc.push({mark: 'o', idx: idx});
        }
        return acc;
      }
      , []
    );
  } 

  // checks for col, row or diag for win (markCount===3) or impending win (2)
  function checkGameStatus (markCount) {
    var result = {},
        reduceResult;

    reduceResult = checkLine('rows', markCount);
    if (reduceResult.length > 0){
      result.rows = reduceResult;
    }

    reduceResult = checkLine('cols', markCount);
    if (reduceResult.length > 0){
      result.cols = reduceResult;
    }

    reduceResult = checkLine('diags', markCount);
    if (reduceResult.length > 0){
      result.diags = reduceResult;
    }

    return result;
  }

  //checks if palyer has won, or drawn game (all cells taken)
  //currently ends when all cells claimed, but possibly should end when
  //only one cell left and no win possible
  function checkGameEnd (player) {
    var winResult = checkGameStatus(3),
        emptyCell = false,
        i, j;

    if (winResult.rows) {
      $('.r' + winResult.rows[0].idx).addClass('winner');
      gameOver = true;
    } else if (winResult.cols) {
      $('.c' + winResult.cols[0].idx).addClass('winner');
      gameOver = true;
    } else if (winResult.diags) {
      if (winResult.diags[0].idx === 0){
        $('#r0c0, #r1c1, #r2c2').addClass('winner');
      } else {
        $('#r0c2, #r1c1, #r2c0').addClass('winner');
      }
      gameOver = true;
    }
    if (gameOver){
      updateScore(player);
      swapMark = true;
      $('#human-turn, #computer-turn').hide();
      if (player === 'human'){
        $('#human-win').modal('show');
      } else {
        $('#computer-win').modal('show');
      }
    } else {
      //check for drawn game: all cells filled
      for(i=0; i<3; i++){
        for(j=0; j<3; j++){
          if (!game.cells[i][j]){
            emptyCell = true;
            break;
          }
        }
        if (emptyCell) {
          break;
        }
      }
      if (!emptyCell){
        gameOver = true;
        swapMark = true;
        $('#human-turn, #computer-turn').hide();
        $('#drawn-game').modal('show');
      }
    }
  }

  //makes the requested move: displays mark in cell, updates game data and checks for game end
  function makeMove (r, c, player){
    var imgUrl, mark;
    //console.log(r,c,player);
    if (player === 'human') {
      mark = game.humanMark;
      imgUrl = game.humanMarkUrl;
      $('#human-turn').hide();
      $('#computer-turn').show();
    } else {
      mark = game.computerMark;
      imgUrl = game.computerMarkUrl;
      $('#computer-turn').hide();
      $('#human-turn').show();
    }
    game.moves.push({row: r, col: c, cellNum: getCellNumber(r,c), player: player});
    game.status.rows[r][mark] += 1;
    game.status.cols[c][mark] += 1;
    if ( (r===0 && c===0) || (r===2 && c===2) ) {
      game.status.diags[0][mark] += 1;
    } else if ( (r===0 && c===2) || (r===2 && c===0) ) {
      game.status.diags[1][mark] += 1;
    }
    if ( (r===1 && c===1) ) {
      game.status.diags[0][mark] += 1;
      game.status.diags[1][mark] += 1;
    }
    game.cells[r][c] = mark;
    $('#r'+r+'c'+c).css('background-image', imgUrl);
    checkGameEnd(player);
  }

  // ---- functons used by computer to determine move ---- >>>>>
  //return first winning move for side
  function checkWinningMove(mark, twoMarkLines) {
    var move,
        linesForMark,
        r = -1, 
        c = -1, 
        i;

    if (twoMarkLines.rows) {
      linesForMark = twoMarkLines.rows.filter( function(row) {
        return row.mark === mark;
      });
      if (linesForMark.length > 0){
        r = linesForMark[0].idx;
        for(i=0; i<3; i++){
          if (game.cells[r][i] === '') {
            c = i;
            break;
          }
        }
        if (r > -1 && c > -1){
          move = {r: r, c: c};
        } else {
          r = -1;
          c = -1;
        }
      }
    }
    if (!move && twoMarkLines.cols) {
      linesForMark = twoMarkLines.cols.filter( function(col) {
        return col.mark === mark;
      });
      if (linesForMark.length > 0){
        c = linesForMark[0].idx;
        for(i=0; i<3; i++){
          if (game.cells[i][c] === '') {
            r = i;
            break;
          }
        }
        if (r > -1 && c > -1){
          move = {r: r, c: c};
        } else {
          r = -1;
          c = -1;
        }
      }
    }
    if (!move && twoMarkLines.diags) {
      linesForMark = twoMarkLines.diags.filter( function(diag) {
        return diag.mark === mark;
      });
      if (linesForMark.length > 0){
        if (game.cells[1][1] === ''){
          move = {r: 1, c: 1};
        }
        if (!move) {
          if (linesForMark[0].idx === 0){
            if (game.cells[0][0] === ''){
              move = {r: 0, c: 0};
            } else if (game.cells[2][2] === ''){
              move = {r: 2, c: 2};
            }
          } else {
            if (game.cells[0][2] === ''){
              move = {r: 0, c: 2};
            } else if (game.cells[2][0] === ''){
              move = {r: 2, c: 0};
            }
          }
        }
      }
    }
    return move;
  }

  //returns cell object with r and c for any open corner, or undefined in all corners taken
  function getAnyCorner() {
    var corner,
        result;

    if (game.cells[0][0] && game.cells[0][2] && game.cells[2][0] && game.cells[2][2] ){
      return;
    }
    while (!result) {
      corner = Math.floor(Math.random() * 4);
      switch (corner) {
        case 0:
          if (!game.cells[0][0]){
            result = {r: 0, c: 0};
          }
          break;
        case 1:
          if (!game.cells[0][2]){
            result = {r: 0, c: 2};
          }
          break;
        case 2:
          if (!game.cells[2][0]){
            result = {r: 2, c: 0};
          }
          break;
        default:
          if (!game.cells[2][2]){
            result = {r: 2, c: 2};
          }
      }
    } 
    return result;
  }

  //returns random empty cell 
  function getAnyEmptyCell() {
    var r, c, result;
    if (game.moves.length > 8){
      return;
    }
    while (!result){
      r = Math.floor(Math.random() * 3);
      c = Math.floor(Math.random() * 3);
      if (!game.cells[r][c]){
        result = {r: r, c: c};
      }
    }
    return result;
  }

  //makes computer move
  function makeComputerMove () {
    var r, 
        c, 
        winMove, 
        moveMade = false,
        twoMarkLines = checkGameStatus(2),
        cell,
        prevComputerCell,
        prevHumanCell,
        rnd;

    //all levels check for possible win, for either side, and
    //make that move to win for computer or to block against human win
    //first for computer
    winMove = checkWinningMove(game.computerMark, twoMarkLines);
    if (winMove) {
      r = winMove.r;
      c = winMove.c;
      moveMade = true;
    }
    //now human - will play to block
    if (!moveMade) {
      winMove = checkWinningMove(game.humanMark, twoMarkLines);
      if (winMove) {
        r = winMove.r;
        c = winMove.c;
        moveMade = true;
      }
    }
    if (!moveMade) {
      //vpoor computer: selects a random empty cell
      if (computerLevel === 'vpoor'){
        cell = getAnyEmptyCell();
        r = cell.r;
        c = cell.c;
      } else if (computerLevel === 'poor'){
        //poor computer: if computer first, randomly selects corner or middle,
        //then selects random empty cell
        switch (game.moves.length) {
          case 0:
            rnd = Math.floor(Math.random() * 5);
            switch (rnd) {
              case 0:
                r = 0;
                c = 0;
                break;
              case 1:
                r = 0;
                c = 2;
                break;
              case 2:
                r = 1;
                c = 1;
                break;
              case 3:
                r = 2;
                c = 0;
                break;
              default:
                r = 2;
                c = 2;
            }
            break;
          default:
            cell = getAnyEmptyCell();
            r = cell.r;
            c = cell.c;
        }
        moveMade = true;
      } else {
        //average computer: uses following criteria (NB has checked for winning/blocking moves already with none found)
        //first round
        //  computer first: select any corner
        //  computer second: if human chose center, then select any corner, otherwise select center
        //second round
        //  computer first: if human chose center, select adjacent cell to computer's first corner cell
        //                  if human chose opposite corner, take any other corner
        //                  if human chose same row, select adjacent column cell
        //                  if human chose same col, select adjacent row cell
        //                  if center free, select it
        //                  otherwise select any free cell
        //  computer second: if any corner free, select it
        //                   if center free, select it
        //                   otherwise, select any free cell
        // if no selection made by above choices, select any free cell (not that will probably be winning/blocking cells already selected for any winnable/loseable games)
        //        console.log('computer level average');
        switch (game.moves.length) {
          case 0:
            //computer first move: choose one of the four corners
            cell = getAnyCorner();
            r = cell.r;
            c = cell.c;
            moveMade = true;
            break;
          case 1:
            prevHumanCell = game.moves[0].cellNum;
            if ( prevHumanCell === 5 ){
              //human chose the middle, computer must take any corner
              cell = getAnyCorner();
              r = cell.r;
              c = cell.c;
            } else {
              //computer chooses center
              r = 1;
              c = 1;
            } 
            moveMade = true;
            break;
          case 2:
            prevHumanCell = game.moves[1].cellNum;
            prevComputerCell = game.moves[0].cellNum;
            if ( prevHumanCell === 5 ){
              //human chose the middle, computer must take adjacent cell to original corner
              if (game.moves[0].row === 0) {
                r = 0;
                c = 1;
              } else {
                r = 2;
                c = 1;
              }
            } else {
              if ( (prevComputerCell === 1 && prevHumanCell === 9) || (prevComputerCell ===9 && prevHumanCell ===1) || (prevComputerCell === 3 && prevHumanCell === 7) || (prevComputerCell === 7 && prevHumanCell === 3) ) {
                //human took opposite corner, computer takes another corner
                cell = getAnyCorner();
                r = cell.r;
                c = cell.c;
              } else {
                if (game.moves[0].row === game.moves[1].row) {
                  r = 1;
                  c = game.moves[0].col;
                } else if (game.moves[0].col === game.moves[1].col) {
                  r = game.moves[0].row;
                  c = 1;
                } else if (!game.cells[1][1]){
                  r = 1;
                  c = 1;
                } else {
                  cell = getAnyEmptyCell();
                  r = cell.r;
                  c = cell.c;
                }
              }
            }
            moveMade = true;
            break;
          case 4:
            //if first three moves were corner, corner, corner, there should still be one corner free
            if ( (cornerCellNums.indexOf(game.moves[0].cellNum) > -1) && (cornerCellNums.indexOf(game.moves[1].cellNum) > -1) && (cornerCellNums.indexOf(game.moves[2].cellNum) > -1) ) {
              cell = getAnyCorner();
              if (cell) {
                r = cell.r;
                c = cell.c;
                moveMade = true;
              } 
            }
            if ( !moveMade && !game.cells[1][1] ) {
              r = 1;
              c = 1;
              moveMade = true;
            }
            break;
        }
      }
      if (!moveMade){
        //computer chooses any cell as last resort
        cell = getAnyEmptyCell();
        r = cell.r;
        c = cell.c;
      }
    }

    makeMove(r,c, 'computer');
    computerThinking = false;
  }
  // <<<<< ---- functons used by computer to determine move ----

  //#### >>>>>> set up message modals <<<<< #####
  $('#new-game-modal').modal({
    closable: false,
    onApprove: function() {
      updateScore('computer');
      gameOver = true;
      showmarkSelection = true;
    },
    onHidden: function (){
      if (showmarkSelection) {
        setTimeout( function () { $('#new-game').click(); }, 50);
      }
    }
  });

  $('#after-load-modal').modal({
    closable  : false,
    onApprove : function($element) {
      if ($element.hasClass('x')){
        game.humanMark = 'x';
        game.computerMark = 'o';
      } else {
        game.humanMark = 'o';
        game.computerMark = 'x';
      }
      swapMark = false;
      showmarkSelection = false;
      newGame();
    }
  });

  $('#human-win').modal({
    closable: false,
    onShow: function () { 
      var $this = $(this);
      $this.data('hideInterval', setTimeout(function(){
        $this.modal('hide');
      }, 2000));
    },
    onHidden: newGame
  });

  $('#computer-win').modal({
    closable: false,
    onShow: function () { 
      var $this = $(this);
      $this.data('hideInterval', setTimeout(function(){
        $this.modal('hide');
      }, 2000));
    },
    onHidden: newGame
  });

  $('#drawn-game').modal({
    closable: false,
    onShow: function () { 
      var $this = $(this);
      $this.data('hideInterval', setTimeout(function(){
        $this.modal('hide');
      }, 2000));
    },
    onHidden: newGame
  });
  
  //----- >>>>> element event handler set up <<<<<< ------
  $('#new-game').on('click', function () {
    if (game.moves.length > 0 && !gameOver) {
      $('#new-game-modal').modal('show');
    } else {
      $('#after-load-modal').modal('show');
    }
  });

  $('td').on('click', function () {
    var r, c, id;
    if (computerThinking) {
      return;
    }
    if (gameOver) {
      newGame();
      return;
    }
    id = $(this).attr('id');
    //don't want string for r,c for human turns, and int for computer, so force to number
    r = Number(id.substr(1,1));
    c = Number(id.substr(3,1));
    if (!game.cells[r][c]) {
      makeMove(r,c,'human');
      if (!gameOver) {
        computerThinking = true;
        setTimeout(makeComputerMove, 500);
      }
    }
  });

  //display modal for user to select starting side
  $('#after-load-modal').modal('show');

}(jQuery));