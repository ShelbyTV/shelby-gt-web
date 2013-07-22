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
    var userId = shelby.models.user.get('id');

    var data = {
      shareURL : this._buildShareUrl(userId),
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
        tweetUrl  = this._baseURL + userId;

    var url = 'https://twitter.com/intent/tweet?related=shelby&via=shelby&url=' + tweetUrl + '&text=' + tweetText + '';

    return url;
  },

  _buildShareUrl : function(userId) {
    return this._baseURL + userId;
  },

  _shareToFacebook : function(e){
    e.preventDefault();

    if($(e.currentTarget).hasClass('disabled')){
      return;
    }

    if (typeof FB != "undefined"){
      FB.ui(
        {
          caption     : 'text',
          description : 'videoDescription',
          link        : 'http://shelby.tv/invite',
          method      : 'feed',
          name        : 'videoTitle',
          picture     : 'videoThumbnai'
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