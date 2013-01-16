libs.shelbyGT.notificationStateModel = Backbone.Model.extend({

  defaults : {
    'class'    : 'notification--alert',
    'message'  : null,
    'primary'  : {
      'title' : 'Dismiss',
      'route' : false
    },
    'response' : null,
    'secondary': {
      'title' : false,
      'route' : false
    },
    'timeout'  : 5000,
    'visible'  : false
  }

});
