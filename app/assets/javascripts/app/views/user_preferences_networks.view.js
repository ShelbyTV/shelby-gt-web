libs.shelbyGT.UserPreferencesNetworksView = libs.shelbyGT.UserPreferencesBaseView.extend({

  events : {
    "change #facebookTimeline" : "_updateFacebookTimeline",
    "change #followShelby"     : "_updateFollowShelby"
  },

  className: 'content_lining preferences_page preferences_page--networks',

  options : _.extend({}, libs.shelbyGT.UserPreferencesBaseView.prototype.options, {}),

  template : function(obj){
      return SHELBYJST['preferences-networks'](obj);
  },

  render : function(){

    var networks = this.model.get('authentications');

    var data = {
      preferences : this._preferences,
      facebook    : _.findWhere(networks, {provider: 'facebook'}),
      twitter     : _.findWhere(networks, {provider: 'twitter'}),
      tumblr      : _.findWhere(networks, {provider: 'tumblr'})
    };

    this.$el.html(this.template(data));
  },

  initialize : function(){
    this._preferences = this.model.get('preferences');
  },

  _cleanup : function(){
  },

  _updateFacebookTimeline : function(e){

    this._updatedUserPreferences = {
      open_graph_posting: $('#facebookTimeline').is(':checked')
    };

    this._doUpdateUserPreferences(this._updatedUserPreferences);
  },

  _updateFollowShelby : function(e){
    console.log('follow shelby');
  }

});