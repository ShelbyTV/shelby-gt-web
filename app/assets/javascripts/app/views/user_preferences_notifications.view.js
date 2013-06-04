libs.shelbyGT.UserPreferencesNotificationsView = libs.shelbyGT.UserPreferencesBaseView.extend({

  events: {
    "submit .js-submit-notifications" : "_onSubmit"
  },

  className: 'content_lining preferences_page preferences_page--notifications',

  options : _.extend({}, libs.shelbyGT.UserPreferencesBaseView.prototype.options, {}),


  template : function(obj){
      return SHELBYJST['preferences-notifications'](obj);
  },

  render : function(){
    this._preferences = this.model.get('preferences');

    this.$el.html(this.template({preferences: this._preferences}));
  },

  initialize : function(){
    console.log('/preferences/notficiations!');
  },

  _cleanup : function(){
  },

  _onSubmit : function(e){
    e.preventDefault();
    console.log('_onSubmit',e);

    _(this._preferences).extend({
      email_updates               : $('#notificationNews').is(':checked'),
      like_notifications          : $('#notificationLikes').is(':checked'),
      reroll_notifications        : $('#notificationReRolls').is(':checked'),
      roll_activity_notifications : $('#notificationRollActivity').is(':checked')
    });

    this._updateUser(this._preferences);
  },

  _updateUser : function(updates) {
    var self = this;

    this.model.save({preferences: updates}, {
      success: function(model, response){
        console.log('success',response);
        shelby.alert(self._preferencesSuccessMsg);
      },
      error: function(model, response){
        console.log('error',response);
        shelby.alert(self._preferencesErrorMsg,self._preferencesErrorMsgCallback);
      }
    });

  }

});