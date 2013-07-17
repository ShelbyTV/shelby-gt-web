libs.shelbyGT.UserPreferencesFriendsView = libs.shelbyGT.UserPreferencesBaseView.extend({

  events : {
  },

  className: 'content_lining preferences_page preferences_page--friends',

  options : _.extend({}, libs.shelbyGT.UserPreferencesBaseView.prototype.options, {}),

  template : function(obj){
      return SHELBYJST['preferences-friends'](obj);
  },

  render : function(){
    var data = {};

    this.$el.html(this.template(data));
  },

  initialize : function(){
    this._preferences = this.model.get('preferences');
  },

  _cleanup : function(){
  },

  _onSubmit : function(e){
  },

  _clearErrors : function() {
    this.$('.form_fieldset').removeClass('form_fieldset--error');
  }

});