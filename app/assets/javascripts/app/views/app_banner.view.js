libs.shelbyGT.AppBannerView = Support.CompositeView.extend({

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

  render : function(){
    var currentUser = this.model.get('currentUser');
    if (!currentUser || !currentUser.has('id')) {
      this.$el.html('Waiting for user info');
    } else {
      var specialConfig = _(shelby.config.dotTvNetworks.dotTvCuratorSpecialConfig).findWhere({id: currentUser.id});
      if (specialConfig && specialConfig.showAppBanner) {
        this.$el.html('Show a banner');
      } else {
        this.$el.html("Don't show a banner");
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
  }

});