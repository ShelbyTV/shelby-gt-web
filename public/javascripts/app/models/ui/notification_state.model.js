libs.shelbyGT.notificationStateModel = Backbone.Model.extend({

  defaults : {
		'visible' : false,
    'message' : null,
		'response' : null,
		'button_one' : {visible: true, text: "Ok", color: "blue"},
		'button_two' : {visible: false, text: "Cancel", color: "grey"},
		'number_of_buttons' : 'one'
  }

});
