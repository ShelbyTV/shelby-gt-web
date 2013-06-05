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

    this.$el.html(this.template({preferences: this._preferences}));
  },

  initialize : function(){
    console.log('/preferences/notficiations!');
    this._preferences = this.model.get('preferences');
  },

  _cleanup : function(){
  },

  _onSubmit : function(e){
    e.preventDefault();

    this._updatedUserPreferences = {
      email_updates               : $('#notificationNews').is(':checked'),
      like_notifications          : $('#notificationLikes').is(':checked'),
      reroll_notifications        : $('#notificationReRolls').is(':checked'),
      roll_activity_notifications : $('#notificationRollActivity').is(':checked')
    };

    this._doUpdateUserPreferences(this._updatedUserPreferences);
  }


});