$(document).ready(function(){
  console.log('twilio-appstore');
  $('#x').on('submit',function(e){
    console.log('submit?');
    // e.preventDefault();
    // $.ajax({
    //   data: {
    //     to: $(this).find('#sms')
    //   },
    //   type: 'POST',
    //   url: e.target.action
    // });
  });

  $('.js-popup--sms').on('click',function(e){
    if(this == e.target) { $(this).toggleClass('hidden',true); }
    return false;
  });
});