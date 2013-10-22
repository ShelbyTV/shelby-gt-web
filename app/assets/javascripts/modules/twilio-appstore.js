$(document).ready(function(){
  console.log('twilio-appstore');
  $('.js-sms-twilio').on('submit',function(e){
    e.preventDefault();
    $.ajax({
      data: {
        to: $(this).find('#sms').val(),
        type: 1
      },
      dataType: 'jsonp',
      url: e.target.action,
      success: function(data){
        //TODO: Display success
      },
      error: function(response){
        //TODO: Tell the user to check the number and try again
      }
    });
  });

  $('.js-popup--sms').on('click',function(e){
    if(this == e.target) { $(this).toggleClass('hidden',true); }
    return;
  });
});