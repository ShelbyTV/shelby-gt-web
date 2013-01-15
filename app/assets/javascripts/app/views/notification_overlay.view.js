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
      var primary = this.model.get('primary');

      if(primary.title && primary.route) { //if it doesn't say "Dismiss, then we're doing something special"
        this._determineRoute(primary.route);
      }

      this.model.set('response', 1);
      this._resetDefaults();
      return false;
    },

    _handleSecondary : function(data){
      var secondary = this.model.get('secondary');
      if(secondary.title && secondary.route) { //if it doesn't say "No thanks", then we're doing something special
        this._determineRoute(secondary.route);
      }

      this.model.set('response', 0);
      this._resetDefaults();
      return false;
    },

    _resetDefaults : function(){
      this.model.set('visible',false);
      this.model.set('response',null);
    },

    _determineRoute : function(data) {
      if(data.indexOf('http://') != -1) {
        //if http:// is present in string, then it's a popup
        this._handlePopupLink(data);
      } else {
        //if http:// is NOT present in string, then its a roll ID
        this._handleRollRoute(data);
      }
    },

    _handleRollRoute : function(rollId){
      shelby.router.navigate('roll/' + rollId, {trigger:true,replace:true});
      this.model.set({visible: false, response: null});
    },

    _handlePopupLink : function(href){
      window.open(href, "_shelbyChat");
    }

  });
} ());