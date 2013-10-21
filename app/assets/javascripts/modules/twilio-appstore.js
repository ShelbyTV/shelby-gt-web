$(document).ready(function(){
  console.log('twilio-appstore');
  $('.js-sms-twilio').on('submit',function(e){
    e.preventDefault();
    $.ajax({
      data: {
        to: $(this).find('#sms')
      },
      type: 'POST',
      url: e.target.action
    });
  });

  $('.js-popup--sms').on('click',function(e){
    if(this == e.target) { $(this).toggleClass('hidden',true); }
    return;
  });
});