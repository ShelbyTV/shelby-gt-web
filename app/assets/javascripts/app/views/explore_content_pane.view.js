libs.shelbyGT.ExploreContentPaneView = Support.CompositeView.extend({

  el: '.js-explore-layout .content_lining',

  template : function(obj){
      return JST['explore-content-pane'](obj);
  },

  initialize : function(){
    this.model.bind('change:displayedRollCategory', this._onRollCategoryChange, this);
  },

  _cleanup : function(){
    this.model.unbind('change:displayedRollCategory', this._onRollCategoryChange, this);
  },

  render : function(){
    this.$el.html(this.template());
  },

  _onRollCategoryChange : function(exploreGuideModel, displayedRollCategory) {
    this._leaveChildren();
    this.appendChildInto(new libs.shelbyGT.ListView({
      className: 'explore-list explore-rolls',
      collectionAttribute : 'rolls',
      doStaticRender : true,
      listItemView : 'ExploreRollItemView',
      model : displayedRollCategory,
      tagName : 'ol'
    }), '.js-explore-body');
  }

});