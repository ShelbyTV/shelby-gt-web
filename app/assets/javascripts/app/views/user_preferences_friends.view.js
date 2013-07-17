libs.shelbyGT.UserPreferencesFriendsView = libs.shelbyGT.UserPreferencesBaseView.extend({

  events : {
  },

  className: 'content_lining preferences_page preferences_page--friends',

  options : _.extend({}, libs.shelbyGT.UserPreferencesBaseView.prototype.options, {}),

  template : function(obj){
      return SHELBYJST['preferences-friends'](obj);
  },

  render : function(){
    var userId = shelby.models.user.get('id');

    var data = {
			tweetURL : this._buildTweetUrl(userId)
		};

    this.$el.html(this.template(data));
  },

  initialize : function(){
    this._preferences = this.model.get('preferences');
  },

  _cleanup : function(){
  },

  _buildTweetUrl : function(userId) {

    var tweetText = encodeURIComponent('Friends, join me on Shelby'),
        tweetUrl  = 'http://shelby.tv/invite?id=' + userId;

    var url = 'https://twitter.com/intent/tweet?related=shelby&via=shelby&url=' + tweetUrl + '&text=' + tweetText + '';

    return url;
  }

});