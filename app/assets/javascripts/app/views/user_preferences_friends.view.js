libs.shelbyGT.UserPreferencesFriendsView = libs.shelbyGT.UserPreferencesBaseView.extend({

  _baseURL : 'http://shelby.tv/invite?id=',

  events : {
    'click .js-facebook-post' : '_shareToFacebook'
  },

  className: 'content_lining preferences_page preferences_page--friends',

  options : _.extend({}, libs.shelbyGT.UserPreferencesBaseView.prototype.options, {}),

  template : function(obj){
      return SHELBYJST['preferences-friends'](obj);
  },

  render : function(){
    this._userId = shelby.models.user.get('id');

    var data = {
      shareURL : this._buildShareUrl(this._userId),
			tweetURL : this._buildTweetUrl(this._userId)
		};

    this.$el.html(this.template(data));
  },

  initialize : function(){
    this._preferences = this.model.get('preferences');
  },

  _cleanup : function(){
  },

  _buildTweetUrl : function() {

    var tweetText = encodeURIComponent('Friends, join me on Shelby'),
        tweetUrl  = this._baseURL + this._userId;

    var url = 'https://twitter.com/intent/tweet?related=shelby&via=shelby&url=' + tweetUrl + '&text=' + tweetText + '';

    return url;
  },

  _buildShareUrl : function() {
    return this._baseURL + this._userId;
  },

  _shareToFacebook : function(e){
    e.preventDefault();

    if (typeof FB != "undefined"){
      FB.ui(
        {
          caption     : 'Join me on Shelby.tv', //subheader
          description : 'Your single stream of video', //message
          link        : this._baseURL + this._userId,
          method      : 'feed',
          name        : 'Shelby.tv', //header
          picture     : 'http://shelby.tv/images/mark_144sq.png'
        },
        function(response) {
          if (response && response.post_id) {
            // TODO:we should record that this happened.
          }
        }
      );
    }
  }

});