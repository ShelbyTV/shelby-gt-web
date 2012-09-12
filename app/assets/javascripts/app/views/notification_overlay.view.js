( function(){
	
  libs.shelbyGT.notificationOverlayView = Support.CompositeView.extend({

    el: '#js-notifications-wrapper',

		events: {
			"click button"			: "_handleResponse",
			"click .roll-route"	: "_handleRollRoute"
		},

    _listView : null,

		template : function(obj){
			return JST['notification-overlay'](obj);
		},

    initialize : function(){
      this.model.bind('change:visible', this._onVisiblityChange, this);
			this.model.bind('change:message change:class change:number_of_buttons change:button_one change:button_two', this.render, this);
			this.render();
    },
		
		render : function(){
			this.$el.html(this.template({model:this.model}));
		},
		
    _cleanup : function() {
      this.model.unbind('change:visible', this._onVisiblityChange, this);
			this.model.unbind('change:message change:class change:number_of_buttons change:button_one change:button_two', this.render, this);
    },

		_onVisiblityChange : function(model){
			if (model.get('visible')){
				this.$el.show();
				this.$el.find('button').first().focus();
			}
			else {
				this.$el.hide();
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
		},
		
		_handleRollRoute : function(e){
			e.preventDefault();
			shelby.router.navigate('roll/' + $(e.currentTarget).data('roll_id'), {trigger:true,replace:true});
			this.model.set({visible: false, response: null});
		}
	
	});
} ());