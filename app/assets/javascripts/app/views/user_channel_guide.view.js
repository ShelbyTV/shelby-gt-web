libs.shelbyGT.UserChannelGuideView = Support.CompositeView.extend({

  options : {
    userChannelsCollectionModel : null
  },

  template : function(obj){
    return SHELBYJST['user-channel-guide'](obj);
  },

  initialize : function(){
    this.model.bind('change:currentUser', this._onCurrentUserChange, this);
    if (this.model.has('currentUser')) {
      this.model.get('currentUser').bind('change:id nickname', this.render, this);
    }
  },

  _cleanup : function(){
    this.model.unbind('change:currentUser', this._onCurrentUserChange, this);
    if (this.model.has('currentUser')) {
      this.model.get('currentUser').unbind('change', this.render, this);
    }
  },

  render : function(){
    this._leaveChildren();
    this.$el.html(this.template({user:this.model.get('currentUser')}));

    var currentUser = this.model.get('currentUser');
    if (currentUser && !currentUser.isNew()) {
      this.renderChild(new libs.shelbyGT.ListView({
        collectionAttribute : 'rolls',
        doStaticRender : true,
        el : '.js-user-channel-list',
        listItemViewAdditionalParams : {
          activationStateModel : shelby.models.guide,
          userProfileModel : this.model
        },
        listItemView : 'UserChannelItemView',
        model : this.options.userChannelsCollectionModel
      }));
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