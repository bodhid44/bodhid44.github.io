/*global jQuery */
(function($) {
  'use strict';
  var quotations = [],
      autoDisplay = true,           //to display the first retrieved quote
      bufferSize = 10,
      currentQuote = {quote: ''};

  function displayBufferStatus(){
    var curBufferSize = quotations.length;
    $('i.battery').hide();
    switch (curBufferSize){
      case 0:
        $("#b-empty").show();
        break;
      case 1:
      case 2:
      case 3:
        $("#b-low").show();
        break;
      case 4:
      case 5:
      case 6:
        $("#b-medium").show();
        break;
      case 7:
      case 8:
      case 9:
        $("#b-high").show();
        break;
      default:
        $("#b-full").show();
    }
    $('#quotes-buffered').text(quotations.length);
  }

  function getQuote() {
    $.ajax({
      dataType: 'json',
      url: 'https://cors-anywhere.herokuapp.com/http://api.forismatic.com/api/1.0/?method=getQuote&key=444444&format=json&lang=en',
      success: addQuote
    });
  }

  function setUpTweet(){
    if (!currentQuote || !currentQuote.tweet){
      return;
    }
    $('#twitter-share').attr('href', 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(currentQuote.tweet) + '&url=%20');
  }

  function displayQuote(useCurrentQuote){
    var quote,
        truncQuote,
        lastSpaceIdx,
        quoteHtml,
        quoteTweet,
        authorIsRed = false,
        tweetLength; 

    $('#attribution').removeClass("red");
    //hide the 'quote too long' footnote
    $('#length-warning').hide();
    //useCurrentQuote will be true for redisplay after changed tweet length
    if (useCurrentQuote && currentQuote && currentQuote.quote){
      quote = currentQuote;
    } else {
      //get a quote
      while (quotations.length > 0) {
        quote = quotations.pop();
        if (quote.quote !== currentQuote.quote){
          break;
        }
      }
    }
    //if UI changes default length, may need to change 140 to 280
    tweetLength = $('#tweet-length').dropdown('get value') || 140;
    if (quote && quote.quote.length > 0){
      //check if quote too long for tweet, including quotation marks and missing text "..." which will be added
      if (quote.quote.length > (tweetLength - 5)) { 
        //get position of last space, 
        truncQuote = quote.quote.substr(0, tweetLength - 5); 
        lastSpaceIdx = truncQuote.lastIndexOf(' ');
        //make the display quote, incluidng span to indicate text that won't make it into the tweet
        quoteHtml = '"' + quote.quote.substr(0, lastSpaceIdx) + '<span>' + quote.quote.substr(lastSpaceIdx) + '</span>"'; 
        quoteTweet  = '"' + quote.quote.substr(0, lastSpaceIdx) + '..."'; 
        //no space for author
        authorIsRed = true;
      } else if ( (quote.quote.length + quote.author.length) > (tweetLength-5)) {
        //no space for author
        quoteHtml = '"' + quote.quote + '"';
        quoteTweet = quoteHtml;
        authorIsRed = true;
      } else {
        //include author
        quoteHtml = '"' + quote.quote + '"';
        quoteTweet = quoteHtml + " - " + quote.author;
      }
      quote.tweet = quoteTweet;
      //display the quote and author
      $('#quotation').html('<p>' + quoteHtml + '</p>');
      if (authorIsRed) {
        //always red if tweet too long, including author 
        $('#attribution').addClass("red");
        $('#attribution').text('*' + quote.author); 
        //show footnote
        $('#length-warning').show();
      } else {
        $('#attribution').text(quote.author); 
      }
      currentQuote = quote;
      setUpTweet();
      displayBufferStatus();
    }
    getQuote();
  }

  function addQuote(data, status) {
    if (status === 'success'){
      quotations.push({quote:data.quoteText, author: data.quoteAuthor});
      if (autoDisplay){
        displayQuote();
        autoDisplay = false;
      }
      displayBufferStatus();
    }
    if (quotations.length < bufferSize){
      getQuote();
    }
  }

  $('#button-new-quote').on('click', function(){
    displayQuote();
  });

  $('.ui.dropdown').dropdown({
    onChange: function(){
      displayQuote(true);
    }
  });
  $('#length-warning').hide();
  $('i.battery').hide();
  $("#b-empty").show();
  getQuote();
  getQuote();
}(jQuery));