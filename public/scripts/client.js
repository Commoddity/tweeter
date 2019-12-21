//Clientside Javascript

//Variable to store total number of loaded tweets (increments up by one each Tweet posted)
let loadedTweets = 0;

//Escape function to disable potential malicious scripts
const escape = (str) => {
  const escDiv = document.createElement('div');
  escDiv.appendChild(document.createTextNode(str));
  return escDiv.innerHTML;
};

//Tweet Generation Functions Follow
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
    setTimeout(() => { $('.error-message:visible').slideToggle(500) }, 2000);
  };
  
  //Loops through Tweets and renders them on page via prepending to HTML container
  const renderTweets = (tweets) => {
    const queriedHTML = $('.container .tweets')
  for (let i = loadedTweets; i < tweets.length; i++) {
    loadedTweets++;
    const tweetElement = createTweetElement(tweets[i]);
    queriedHTML.prepend(tweetElement);
  }
};

//Sends an AJAX request to stored Tweet Database and renders upon success
const loadTweets = () => {
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

//Hides error message, new tweet form and scroll button on page load
$(document).ready(() => {
  $('.error-message').hide();
  $('.new-tweet').hide();
  $('#float-button').hide();
});

//New Tweet Form Submission function, including error message display.
//On form submission, sends AJAX post request, calls loadTweets function and resets text form, counter and error message
$(document).ready(() => {
  $('.new-tweet form').submit(function(event) {
    event.preventDefault();
    const form = $(this);
    const newTweet = form.serialize();
    const prefixLength = ($('#tweet-form').attr('name').length) + 1;
    if (newTweet.length - prefixLength === 0) {
      createErrorBar('Your Tweet must contain some characters!');
      return false;
    } else if (newTweet.length - prefixLength > 140) {
      createErrorBar('Your Tweet must be 140 characters or less!');
      return false;
    } else {
      $.ajax({
        data: newTweet,
        method: 'POST',
        url: '/tweets/'
      })
      .then(() => {
        loadTweets();
        $('.new-tweet form')[0].reset();
        $('.counter').text('140');
        $('.error-message:visible').slideToggle('slow');
      })
      .fail((err) => {
          console.log(err);
        });
    }
  });
});

//Write a new tweet link that scrolls to New Tweet input form.
//Includes different behavior depending on responsive layout.
$(document).ready(() => {
  $('.click-scroll').click(() => {
    if (window.scrollY > 0) {
      //If viewport is scrolled down, scroll up and ensure new tweet field is visible.
      if ($(window).width() < 1024) {
        $('html, body').animate({ scrollTop: 400 }, 'slow');
      } else {
        $('html, body').animate({ scrollTop: 0 }, 'slow');
      }
      $('#new-tweet:hidden').slideToggle('slow');
    } else {
      //If viewport is not scrolled down, toggle new tweet field.
      $('#new-tweet').slideToggle('slow');
    }
    $('.error-message').hide();
    $('textarea').focus();
  });
});

//Reveals scroll-to-top-of-page button when user scrolls down page
$(document).ready(() => {
  $(window).scroll(() => {
    if ($(window).scrollTop() > 400) {
      $('#float-button:hidden').show().animate({opacity: 0.9}, 1500);
    } else if ($(window).scrollTop() < 400) {
      $('#float-button:visible').fadeOut(1000);
    }
  })
});

//Scrolls window to top of page when button is clicked
$(document).ready(() => {
  $('#float-button').click(() => {
    if ($(window).width() < 1024) {
      $('html, body').animate({ scrollTop: 400 }, 'slow');
    } else {
      $('html, body').animate({ scrollTop: 0 }, 'slow');
    }
  })
});

//Function that counts the number of characters left of the 140 character limit. Turns red at negative values.
$(document).ready(() => {
  $('.new-tweet textarea').keyup(() => {
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
$(document).ready(() => {
  loadTweets();
});