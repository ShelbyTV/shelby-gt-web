libs.shelbyGT.MeListView = Support.CompositeView.extend({

  template : function(obj){
    return JST['me-list'](obj);
  },

  initialize : function() {
    this.render();
  },

  render : function(){
    this.$el.html(this.template());
    this.appendChildInto(new libs.shelbyGT.RollListView({
      binarySearchOffset : 0,
      model : this.model,
      doSmartRefresh : !this.model.get('rolls').isEmpty(),
      doStaticRender : true,
      listItemView : 'RollItemRollView',
      rollListFilterType : libs.shelbyGT.RollListFilterType.following
    }), '.js-following-rolls-list');
  }

});
