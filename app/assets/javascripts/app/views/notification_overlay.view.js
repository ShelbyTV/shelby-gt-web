( function(){

  libs.shelbyGT.notificationOverlayView = Support.CompositeView.extend({

    el: '#js-notifications-wrapper',

    events: {
      "click .js-button"     : "_handleResponse",
      "click .js-roll-route" : "_handleRollRoute",
      "click .js-open-popup" : "_handlePopupLink"
    },

    _listView : null,

    template : function(obj){
      return SHELBYJST['notification-overlay'](obj);
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
      this.$el.toggleClass('hide',!model.get('visible'));
      this.$el.find('.js-confirm').first().focus();
    },

    _handleResponse : function(data){
      if ($(data.target).hasClass('js-confirm')) {
        this.model.set('response', 1);
      }
      else if ($(data.target).hasClass('js-cancel')) {
        this.model.set('response', 0);
      }
      this.model.set('visible',false);
      this.model.set('response',null);
    },

    _handleRollRoute : function(e){
      e.preventDefault();
      shelby.router.navigate('roll/' + $(e.currentTarget).data('roll_id'), {trigger:true,replace:true});
      this.model.set({visible: false, response: null});
    },

    _handlePopupLink : function(e){
      e.preventDefault();
      window.open(e.currentTarget.href, "_shelbyChat");
    }

  });
} ());