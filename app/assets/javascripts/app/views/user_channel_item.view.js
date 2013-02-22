libs.shelbyGT.UserChannelItemView = libs.shelbyGT.ActiveHighlightListItemView.extend({

  _channelListView : null,

  events : {
  },

  options : _.extend({}, libs.shelbyGT.ActiveHighlightListItemView.prototype.options, {
      activationStateProperty : 'activeFrameModel'
  }),

  className : 'list_item user-channel-item',

  template : function(obj){
    return SHELBYJST['user-channel-item'](obj);
  },

  render : function(){
    var self = this;

    this.$el.html(this.template({roll : this.model}));
    this._channelListView = new libs.shelbyGT.RollView({
      collapseViewedFrameGroups : false,
      fetchParams : {
        include_children : true
      },
      noMoreResultsViewProto : null,
      firstFetchLimit : 5,
      infinite : false,
      isIntervalComplete : function() {
        return false;
      },
      limit : 6,
      listItemView : 'UserChannelFrameItemView',
      model : this.model
    });
    this.appendChildInto(this._channelListView, '.js-user-channel');
    this.model.fetch({
      success: function(rollModel, resp){
        var newWidth = self._channelListView._displayCollection.length * 300 + 150;
        self.$('.js-user-channel').width(newWidth + 'px');
      }
    });
    return libs.shelbyGT.ActiveHighlightListItemView.prototype.render.call(this);
  },

  // override ActiveHighlightListItemView abstract method
  doActivateThisItem : function(guideModel){
    var activeFrameModel = guideModel.get('activeFrameModel');
    return activeFrameModel && activeFrameModel.has('roll') && this.model.id == activeFrameModel.get('roll').id;
  }

});