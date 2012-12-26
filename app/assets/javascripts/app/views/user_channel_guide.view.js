libs.shelbyGT.UserChannelGuideView = Support.CompositeView.extend({

  options : {
    userChannelsCollectionModel : null
  },

  events: {
  },

  template : function(obj){
    return SHELBYJST['user-channel-guide'](obj);
  },

  initialize : function(){
    this.model.bind('change', this.render, this);
    this.model.bind('change:id', this._getUserChannels, this);
  },

  _cleanup : function(){
   this.model.unbind('change', this.render, this);
   this.model.unbind('change:id', this._getUserChannels, this);
  },

  render : function(){
    this._leaveChildren();
    this.$el.html(this.template({user:this.model}));

    if (!this.model.isNew()) {
      this.renderChild(new libs.shelbyGT.SmartRefreshListView({
        collectionAttribute : 'rolls',
        doSmartRefresh : true,
        el : '.js-user-channel-list',
        listItemViewAdditionalParams : {
          activationStateModel : shelby.models.guide
        },
        listItemView : 'UserChannelItemView',
        model : this.options.userChannelsCollectionModel
      }));
    }
  },

  _getUserChannels : function(user, id) {
    if (id) {
      var previousRolls = this.options.userChannelsCollectionModel.get('rolls');
      if (previousRolls) {
        previousRolls.reset();
      }
      this.options.userChannelsCollectionModel.fetch({
        url: shelby.config.apiRoot + '/roll/' + user.get('personal_roll_id') + '/associated',
        success: function(rollsCollection, resp){
          console.log('associated rolls fetched', arguments);
        }
      });
    }
  }

});