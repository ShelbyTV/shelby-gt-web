//= require jquery
//= require 'common/spin'

$(document).ready(function(){

  // reseting text input
  $('input:text').select();
  $('input:text').focusin(function(){
    $(this).attr('placeholder','').css('background-color','white');
  });

  // show/hide learn more section on hover
  $('#learn-more-wrapper #learn-more-icon').hover(function(){
    $("#learn-more").show();
    $('input:text').select();
    shelby.track('Learn More', 'Show');
  }, function(){
    $("#learn-more").hide();
    $('input:text').select();
  });

});