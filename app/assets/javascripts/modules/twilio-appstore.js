$(document).ready(function(){
  var $smsPopup = $('.js-popup--sms'),
      $smsForm = $smsPopup.find('.js-sms-twilio');

  $smsForm.on('submit',function(e){
    e.preventDefault();

    $this = $(this);

    var $input = $this.find('#sms').attr('disabled',true);

    var options = {
      providers : ['ga'],
      gaCategory : shelbyTrackingCategory,
      gaAction : 'SMS Submission',
      gaLabel : 'Success',
    };

    $.ajax({
      data: {
        to: $input.val(),
        type: 1
      },
      dataType: 'jsonp',
      url: e.target.action,
      success: function(data){
        var isSuccessful = (data.status === 200);

        $input.removeAttr('disabled').val(''); // isSuccessful ? clear!
        $smsPopup.toggleClass('hidden',isSuccessful);

        shelby.trackEx(options);
      },
      error: function(response){
        $smsForm.find('.form_fieldset').toggleClass('form_fieldset--error',true);
        $input.removeAttr('disabled');

        options.gaLabel = "Failed";
        shelby.trackEx(options);
      }
    });
  });

  $smsPopup.on('click',function(e){
    if(this == e.target) {
      $(this).toggleClass('hidden',true);
    }
    return;
  });
});