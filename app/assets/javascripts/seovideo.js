//load event tracking js
//= require jquery
//= require ./common/ytquery.js
//= require ./event-tracking/seovideo.tracking.js

$(document).ready(function(){
  $('.js-cta-header').toggleClass('button_transparent', !$('body').hasClass('shelby--seo'));
});