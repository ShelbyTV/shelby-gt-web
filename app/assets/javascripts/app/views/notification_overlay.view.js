( function(){

  libs.shelbyGT.notificationOverlayView = Support.CompositeView.extend({

    el: '#js-notifications-wrapper',

    events: {
      "click .js-primary"    : "_handlePrimary",
      "click .js-secondary"  : "_handleSecondary"
    },

    _listView : null,

    template : function(obj){
      return SHELBYJST['notification-overlay'](obj);
    },

    initialize : function(){
      this.model.bind('change:visible', this._onVisiblityChange, this);
      this.model.bind('change:message change:class change:response change:confirm change:cancel', this.render, this);
      this.render();
    },

    render : function(){
      this.$el.html(this.template({model:this.model}));
    },

    _cleanup : function() {
      this.model.unbind('change:visible', this._onVisiblityChange, this);
      this.model.unbind('change:message change:class change:response change:confirm change:cancel', this.render, this);
    },

    _onVisiblityChange : function(model){
      this.$el.toggleClass('hide',!model.get('visible'));
      this.$el.find('.js-primary').first().focus();
    },

    _handlePrimary : function(data){
      this.model.set('response', 1);
      this._doDismiss();
      return false;
    },

    _handleSecondary : function(data){
      this.model.set('response', 0);
      this._doDismiss();
      return false;
    },

    _doDismiss : function(){
      this.model.set('visible',false);
    }

  });
} ());