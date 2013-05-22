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
  if(!$fullNameInput.val().length) {
        $fullNameInput.parent().addClass('form_fieldset--error');
        hasErrors = true;
  }

  // validate password
  var $passwordInput = $form.find('#password');
  // password must have a minimum length
  if($passwordInput.val().length < shelby.config.user.password.minLength) {
        $passwordInput.parent().addClass('form_fieldset--error');
        hasErrors = true;
  }

  // if there are any errors, cancel form submission
  if (hasErrors) {
    e.preventDefault();
  }
}

$(document).ready(function() {

  // wire up user form validation
  $('#user_form').on('submit', validateUserForm);
  // as soon as I start typing in a text input, hide any visual error indication
  // that was displayed for it
  $('.form_fieldset').has('.form_error').on('keyup', 'input', function(e) {
    $(e.delegateTarget).removeClass('form_fieldset--error');
  });
});