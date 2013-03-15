libs.shelbyGT.AppBannerView = Support.CompositeView.extend({

  events : {
    "click .js-facebook-share" : "_submitFacebookShare"
  },

  initialize : function(){
    this.model.bind('change:currentUser', this._onCurrentUserChange, this);
    if (this.model.has('currentUser')) {
      this.model.get('currentUser').bind('change:id', this.render, this);
    }
  },

  _cleanup : function(){
    this.model.unbind('change:currentUser', this._onCurrentUserChange, this);
    if (this.model.has('currentUser')) {
      this.model.get('currentUser').unbind('change:id', this.render, this);
    }
  },

  template : function(obj){
    return SHELBYJST['banner--chips-ahoy'](obj);
  },

  render : function(){
    this.$el.toggleClass('hidden',false);

    var currentUser = this.model.get('currentUser');
    if (!currentUser || !currentUser.has('id')) {
      this.$el.html('');
    } else {
      var specialConfig = _(shelby.config.dotTvNetworks.dotTvCuratorSpecialConfig).findWhere({id: currentUser.id});
      if (specialConfig && specialConfig.showAppBanner) {
        this.$el.html(this.template({
          tweetIntentQueryString : $.param({
            text : "I’m watching the #sweetestbracket on @ChipsAhoy TV http://chipsahoy.tv via @Shelby"
          })
        }));
      } else {
        this.$el.html('');
      }
    }
  },

  _onCurrentUserChange : function(userProfileModel, currentUser) {
    this.render();
    if (currentUser) {
      currentUser.bind('change', this.render, this);
    }
    var previousUser = userProfileModel.previous('currentUser');
    if (previousUser) {
      previousUser.unbind('change', this.render, this);
    }
  },

  _submitFacebookShare : function() {
    if (typeof FB != "undefined"){
      FB.ui(
        {
          method: 'feed',
          name: 'The Sweetest Bracket',
          link: 'http://chipsahoy.tv',
          picture: 'http://s3.amazonaws.com/shelby-gt-user-avatars/sq192x192/513f4963b415cc143a00ec85?1363269645000',
          description: "I’m watching the #sweetestbracket on @ChipsAhoy TV http://chipsahoy.tv via @Shelby"
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