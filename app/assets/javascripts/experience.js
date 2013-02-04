//= require jquery
//= require 'common/spin'

$(document).ready(function(){
  //$('iframe.shelby').attr('src',"<%= Settings::Application.url %>/search");

  $('input:text').select();


  $('#learn-more-wrapper #learn-more-icon').hover(function(){
    $("#learn-more").toggle();
    $('input:text').select();
  });
});