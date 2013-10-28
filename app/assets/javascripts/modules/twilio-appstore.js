$(document).ready(function(){
  // this convenience method ensures that you'll never see
  // the sms form or its success msg at the same time.
  var togglePopupViews = function(visibility) {
    $smsForm.toggleClass('hidden',visibility);
    $smsSuccess.toggleClass('hidden',!visibility);
    $smsWebSignup.toggleClass('hidden',true);
  };

  // smartly caching everything that needs handling.
  // includes the CTA button which is outside of the popup itself.
  var $smsPopup     = $('.js-popup--sms'),
      $smsForm      = $smsPopup.find('.js-sms-twilio'),
      $smsSuccess   = $smsPopup.find('.js-sms-success'),
      $smsWebSignup = $smsPopup.find('.js-sms-signup-web'),
      $smsCtaButton = $('.js-cta');

  $smsCtaButton.on('click',function(e){
    e.preventDefault();

    $smsPopup.toggleClass('hidden',false);
    $smsForm.find('#sms').focus();
    togglePopupViews(false);
  });

  $smsForm.on('submit',function(e){
    e.preventDefault();

    $this = $(this);

    var $input = $this.find('#sms').attr('disabled',true);

    var options = {
      providers  : ['ga'],
      gaCategory : shelbyTrackingCategory,
      gaAction   : 'SMS Submission',
      gaLabel    : 'Success',
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

        $input.removeAttr('disabled').val(''); // isSuccessful? clear!
        togglePopupViews(true);

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
    // hide this pop up if you click on any area outside the popup itself.
    if(this == e.target) {
      $(this).toggleClass('hidden',true);
    }
    return;
  }).on('click','.js-sms-retry', function(e){
    togglePopupViews(false);
  }).on('click','.js-show-web-choices',function(e){
    e.preventDefault();
    $smsPopup.find($smsWebSignup).toggleClass('hidden',false).siblings().toggleClass('hidden',true);
  });

});