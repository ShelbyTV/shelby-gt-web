//App
//= require ../app/libs.namespace
//= require ../app/app.config.js
//= require ../app/app.namespace.js

//JST
//= require ../../templates/share-page-form.jst.ejs

//INIT

$(function(){
  var $dropdown = $('.js-shares-enabled');

  var data = {
    twitter_enabled : false,
    facebook_enabled: false,
    userLoggedIn : false,
    currentFrameShortlink : 'ad'
  };


  $dropdown.html(SHELBYJST['share-page-form'](data));

});