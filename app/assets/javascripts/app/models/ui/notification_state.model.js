libs.shelbyGT.notificationStateModel = Backbone.Model.extend({

  defaults : {
    'class' : 'notification--dialog',
    'message' : null,
    'button_primary' : {
      'title' : 'Dismiss'
    },
    'button_secondary' : {
      'title' : null
    },
    'response' : null,
    'timeout' : 9000,
    'visible' : false
  },

  ReturnValueButtonPrimary : 'primary',
  ReturnValueButtonSecondary : 'secondary'

});
