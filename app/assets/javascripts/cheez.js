//= require ./Cheez/jquery.js
//= require ./Cheez/underscore-1.5.1.js
//= require ./Cheez/backbone-1.1.0.js
//= require ./Cheez/backbone-relational-0.8.7.js

//= require ./Cheez/require.js

$(document).ready(function(){

  $('.vertical')
    .on('mouseenter',function(){
      $(this).addClass('is-open');
    })
    .on('mouseleave',function(){
      $(this).removeClass('is-open');
    });

  $('.js-video').on('click',function(e){
    e.preventDefault();
    $('#shelby').attr('src','http://alpha.shelby.tv/'+$(this).data('src')+'?mode=cheez');
  });

});
