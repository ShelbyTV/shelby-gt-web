libs.shelbyGT.UserChannelItemView = libs.shelbyGT.ActiveHighlightListItemView.extend({

  events : {
  },

  options : _.extend({}, libs.shelbyGT.ActiveHighlightListItemView.prototype.options, {
      activationStateProperty : 'currentRollModel',
      activeClassName : 'active-list-item'
  }),

  className : 'list_item guide-item',

  template : function(obj){
    return SHELBYJST['user-channel-item'](obj);
  },

  render : function(){
    this.$el.html(this.template({roll : this.model}));
    this.appendChild(new libs.shelbyGT.RollView({
      collapseViewedFrameGroups : false,
      fetchParams : {
        include_children : true
      },
      firstFetchLimit : 5,
      infinite : false,
      limit : 6,
      model : this.model
    }));
    this.model.fetch({
      success: function(rollModel, resp){
        console.log("fetched channel roll frames", arguments);
      }
    });
    return libs.shelbyGT.ActiveHighlightListItemView.prototype.render.call(this);
  },

  // override ActiveHighlightListItemView abstract method
  doActivateThisItem : function(exploreGuideModel){
    return false;
  }

});