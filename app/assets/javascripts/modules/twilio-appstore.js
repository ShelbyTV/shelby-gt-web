$(document).ready(function(){
  console.log('twilio-appstore');
  var $smsPopup = $('.js-popup--sms'),
      $smsForm = $smsPopup.find('.js-sms-twilio');

  $smsForm.on('submit',function(e){
    e.preventDefault();

    $this = $(this);

    var $input = $this.find('#sms').attr('disabled',true);

    $.ajax({
      data: {
        to: $input.val(),
        type: 1
      },
      dataType: 'jsonp',
      url: e.target.action,
      success: function(data){
        //TODO: Display success
        var isSuccessful = (data.status === 200);

        $smsPopup.toggleClass('hidden',isSuccessful);
      },
      error: function(response){
        //TODO: Tell the user to check the number and try again
        $smsForm.find('.form_fieldset').toggleClass('form_fieldset--error',true);
        $input.removeAttr('disabled');
      }
    });
  });

  $smsPopup.on('click',function(e){
    if(this == e.target) { $(this).toggleClass('hidden',true); }
    return;
  });
});