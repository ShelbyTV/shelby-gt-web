( function(){
	
  libs.shelbyGT.notificationOverlayView = Support.CompositeView.extend({

    el: '#js-notifications-wrapper',

		events: {
			"click button": "_handleResponse"
		},

    _listView : null,

	  template : function(obj){
	    return JST['notification-overlay'](obj);
	  },

    initialize : function(){
      this.model.bind('change:visible', this._onVisiblityChange, this);
			this.model.bind('change:message', this._onMessageChange, this);
			this.model.bind('change:number_of_buttons', this._onButtonChange, this);
			this.render();
    },
		
		render : function(){
	    this.$el.html(this.template({model:this.model})).draggable({cursor: 'move'});
		},
		
    _cleanup : function() {
      this.model.unbind('change:visible', this._onVisiblityChange, this);
			this.model.unbind('change:message', this._onMessageChange, this);
			this.model.unbind('change:number_of_buttons', this._onButtonChange);
    },

		_onVisiblityChange : function(model){
			if (model.get('visible')){
				this.$el.show();
				this.$el.find('button').first().focus();
			}
			else {
				this.$el.hide();
			};
		},
		
		_onMessageChange : function(model) {
			this.$el.find('#js-message').html(model.get('message'));
		},
		
		_onButtonChange : function(model) {
			if (model.get('number_of_buttons') == "two"){
				// remove class disabled on cancel
				this.$el.find('.button-wrapper').removeClass('one_button').addClass('two_button');
				this.$el.find('#js-notification-cancel').removeClass('disabled');
			}
			else if (model.get('number_of_buttons') == "one"){
				this.$el.find('.button-wrapper').removeClass('two_button').addClass('one_button');
				this.$el.find('#js-notification-cancel').addClass('disabled');
			}
		},
		
		_handleResponse : function(data){
			if ($(data.target).hasClass('notification-confirm')) { 
				this.model.set('response', 1);
			}
			else if ($(data.target).hasClass('notification-cancel')) {
				this.model.set('response', 0);
			}
			this.model.set('visible',false);
			this.model.set('response',null);
		}
	
	});
} ());