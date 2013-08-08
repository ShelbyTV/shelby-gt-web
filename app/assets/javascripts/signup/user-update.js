if (typeof(shelby) == 'undefined') {
  shelby = {};
}
if (typeof(shelby.config) == 'undefined') {
  shelby.config = {};
}
shelby.alert = function(options) {
  message = options.message;
  // strip html paragraph tags out of the alert message
  re = /<p>|<\/p>/gi;
  var match;
  while (match = re.exec(message)) {
    message = message.slice(0, match.index) + message.slice(match.index + match[0].length);
  }
  window.alert(message);
};
$.ajaxPrefilter(function(options, originalOptions, xhr) {
  // attach the API's csrf token to the request for logged in users
  if (options.type.toUpperCase() != 'GET' && !options.no_csrf) {
    var token = $('meta[name=shelby-token]').attr('content');
    if (token) xhr.setRequestHeader('X-CSRF-Token', token);
  }
});

// clear all visual indicators of any form validation errors
function clearUserFormErrors(e) {
  $(e.currentTarget).find('.form_fieldset').has('.form_error').removeClass('form_fieldset--error');
}

// perform client side validation on the user form so we don't
// submit something that is obviously invalid
function validateUserForm(e) {
  var $form = $(e.currentTarget);
  var hasErrors = false;

  clearUserFormErrors(e);

  // validate user full name
  var $fullNameInput = $form.find('#name');
  // entering a name is required
  if($fullNameInput.length > 0 && !$fullNameInput.val().length) {
        $fullNameInput.parent().addClass('form_fieldset--error');
        hasErrors = true;
  }

  // validate username
  var $userNameInput = $form.find('#nickname');
  // entering a username is required
  if(!$userNameInput.val().length) {
        $userNameInput.prevAll('.js-form-error').text('Please enter a username').parent().addClass('form_fieldset--error');
        $userNameInput.parent().find('input').attr('placeholder','');
        hasErrors = true;
  }

  // validate email
  var $emailInput = $form.find('#primary_email');
  // entering an email is required
  if(!$emailInput.val().length) {
        $emailInput.prevAll('.js-form-error').text('Please enter a valid email address').parent().addClass('form_fieldset--error');
        $emailInput.parent().find('input').attr('placeholder','');
        hasErrors = true;
  }

  // validate password
  var $passwordInput = $form.find('#password');
  // password must have a minimum length
  if($passwordInput.val().length < shelby.config.user.password.minLength) {
        $passwordInput.parent().addClass('form_fieldset--error');
        $passwordInput.parent().find('input').attr('placeholder','');
        hasErrors = true;
  }

  // if there are any errors, cancel form submission
  if (hasErrors) {
    shelby.trackEx({
      providers : ['ga', 'kmq'],
      gaCategory : "Onboarding",
      gaAction : 'Signup has errors',
      kmqName : "Onboarding Signup hasErrors"
    });

    e.preventDefault();
  }
  else {
    var shelbyTrackingCategory;
    var location = shelbyTrackingCategory ? shelbyTrackingCategory : "Signup Page";
    shelby.trackEx({
      providers : ['ga', 'kmq'],
      gaCategory : "Onboarding",
      gaAction : 'Signup complete',
      gaLabel : location,
      kmqName : "Onboarding Signup Complete",
      kmqProperties : {
        nickname: $userNameInput.val(),
        location: location
      }
    });
  }
}

$(document).ready(function() {
  $('#user_form input:first[type="text"]').focus();
  // wire up user form validation
  $('#user_form').on('submit', validateUserForm);
  // as soon as I start typing in a text input, hide any visual error indication
  // that was displayed for it
  $('.form_fieldset').has('.form_error').on('keyup', 'input', function(e) {
    $(e.delegateTarget).removeClass('form_fieldset--error');
  });
});
