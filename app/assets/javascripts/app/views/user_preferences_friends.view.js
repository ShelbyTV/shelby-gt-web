libs.shelbyGT.UserPreferencesFriendsView = libs.shelbyGT.UserPreferencesBaseView.extend({

  _baseURL : 'http://shelby.tv/signup/',

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

    console.log('stuff',this.options);

    var data = {
      shareURL : this._buildShareUrl(this._userId),
      tweetURL : this._buildTweetUrl(this._userId)
		};

    this.$el.html(this.template(data));


    console.log(this.options.rollFollowings.get('roll'));
  },

  initialize : function(){
    this._preferences = this.model.get('preferences');
  },

  _cleanup : function(){
  },

  _buildTweetUrl : function() {

    var tweetUrl     = this._baseURL + this._userId,
        tweetMessage = "I'm watching my perfect video stream on @Shelby. Join me and get yours.",
        url          = 'https://twitter.com/intent/tweet?related=shelby&url=' + tweetUrl + '&text=' + encodeURIComponent(tweetMessage) + '';

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
          link        : this._baseURL + this._userId,
          method      : 'send'
        },
        function(response) {
          if (response && response.success) {
            // TODO:we should record that this happened.
          }
        }
      );
    }
  }

});
