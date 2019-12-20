//Clientside Javascript

//Variable to store total number of loaded tweets (increments by one each Tweet posted)
let loadedTweets = 0;

//Escape function to disable potential malicious scripts
const escape =  function(str) {
  let div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
};

//Twet Generation Functions Follow
//Creates Tweet Div for each Post, including jQuery animations, using information stored in database and a randomly generated ID for each Tweet
const createTweetElement = (data) => {
  const date = new Date(data.created_at);
  const tweet = $(`
    <article class='tweet'>
      <div class='tweet-header'>
        <img class='avatar' src='${data.user.avatars}'>
        <span class='username'>${data.user.name}</span>
        <span class='handle'>${data.user.handle}</span>
      </div>
      <p>${escape(data.content.text)}</p>
      <div class='tweet-footer'>
        <span class='date'>${date.toLocaleString()}</span>
        <span class='icons'>
          <img class='icon' src='https://i.ibb.co/ysdt7TN/flag.png'>
          <img class='icon' src='https://i.ibb.co/rk0R0tn/retweet.png'>
          <img class='icon' src='https://i.ibb.co/1Rp54T9/heart.png'>
        </span>
      </div>
    </article>`)
    .css('opacity', '0')
    .css('maxHeight', '0')
    .animate({
      maxHeight: '800px',
      opacity: 1
    }, 1500);
  return tweet;
};

//Populates error bar with HTML and error message
const createErrorBar = (errorText) => {
  $('.error-message').html(`
    <img src='https://i.ibb.co/B4vDsHk/76402.png' class='danger1'>
    ${errorText}
    <img src='https://i.ibb.co/B4vDsHk/76402.png' class='danger2'>`);
  $('.error-message:hidden').slideToggle(500);
  setTimeout(function() { $('.error-message:visible').slideToggle(500) }, 2000);
};

//Loops through Tweets and renders them on page via prepending to HTML container
const renderTweets = (tweets) => {
  for (let i = loadedTweets; i < tweets.length; i++) {
    loadedTweets++;
    const tweetElement = createTweetElement(tweets[i]);
    $('.container .tweets').prepend(tweetElement);
  }
};

//Sends an AJAX request to stored Tweet Database and renders upon success
const loadTweets = function() {
  $.ajax({
    url: '/tweets',
    method: 'GET',
    dataType: 'json',
  })
  .then(renderTweets)
  .fail((err) => {
    console.log(err);
  });
};

//Error Messages
//Hides error message and new tweet form on page load
$(document).ready(function() {
  $('.error-message').hide();
  $('.new-tweet').hide();
});

//New Tweet Form Submission function, including error message display.
//On form submission, sends AJAX post request, calls loadTweets function and resets text form, counter and error message
$(document).ready(function() {
  $('.new-tweet form').submit(function(event) {
    event.preventDefault();
    const form = $(this);
    const newTweet = form.serialize();
    const prefixLength = ($('#tweet-form').attr('name').length) + 1;
    if (newTweet.length - prefixLength === 0) {
      createErrorBar('Your Tweet must contain some characters!')
      return false;
    } else if (newTweet.length - prefixLength > 140) {
      createErrorBar('Your Tweet must be 140 characters or less!')
      return false;
    } else {
      $.ajax({
        data: newTweet,
        method: 'POST',
        url: '/tweets/'
      })
      .then(loadTweets)
      .fail((err) => {
          console.log(err);
        });
      $('.new-tweet form')[0].reset();
      $('.counter').text('140');
      $('.error-message:visible').slideToggle('slow');
    }
  });
});

//Write a new tweet link that scrolls to New Tweet input form.
//Includes different behavior depending on responsive layout.
$(document).ready(function() {
  $('.click-scroll').click(function() {
    const elementTarget = document.getElementById('header');
    if (window.scrollY > (0)) {
      // we're scrolled down.  so let's scroll up, and make sure the form is visible
      if ($(window).width() < 1024) {
        $('html, body').animate({ scrollTop: 400 }, 'slow');
      } else {
        $('html, body').animate({ scrollTop: 0 }, 'slow');
      }
      $('#new-tweet:hidden').slideToggle('slow');
    } else {
      // we're NOT scrolled down.  so whatever visibility the form had, toggle it.
      $('#new-tweet').slideToggle('slow');
    }
    $('.error-message').hide();
    $('textarea').focus();
  });
});

//Function that counts the number of characters left of the 140 character limit. Turns red at negative values.
$(document).ready(function() {
  $('.new-tweet textarea').keyup(function() {
    let count = $('.new-tweet textarea').val().length;
    let charsLeft = 140 - count;
    $('.counter').html(`<span class="counter">${charsLeft}</span>`);
    if (charsLeft < 0) {
      $('.counter').css("color", "red");
    }
    if (charsLeft >= 0) {
      $('.counter').css("color", "white");
    }
  });
});

//Inital call of Load Tweets function to load example tweets stored in database.
$(document).ready(function() {
  loadTweets();
});