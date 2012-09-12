libs.shelbyGT.MeListView = Support.CompositeView.extend({

  template : function(obj){
    return JST['me-list'](obj);
  },

  initialize : function() {
    this.render();
    this.model.bind('change:initialized', this._onRollFollowingsInitialized, this);
  },

  _cleanup : function() {
    this.model.unbind('change:initialized', this._onRollFollowingsInitialized, this);
  },

  render : function(){
    this.$el.html(this.template());
    if (this.model.get('initialized')) {
      this._showHeaders();
    }
    this.appendChildInto(new libs.shelbyGT.RollListView({
      binarySearchOffset : shelby.config.db.rollFollowings.numSpecialRolls,
      model : this.model,
      doSmartRefresh : !this.model.get('rolls').isEmpty(),
      doStaticRender : true,
      listItemView : 'RollItemRollView',
      rollListFilterType : libs.shelbyGT.RollListFilterType.me
    }), '.js-me-rolls-list');
    this.appendChildInto(new libs.shelbyGT.RollListView({
      binarySearchOffset : 0,
      model : this.model,
      doSmartRefresh : !this.model.get('rolls').isEmpty(),
      doStaticRender : true,
      listItemView : 'RollItemRollView',
      rollListFilterType : libs.shelbyGT.RollListFilterType.following
    }), '.js-following-rolls-list');
  },

  _onRollFollowingsInitialized : function(rollFollowingsModel, initialized) {
    if (initialized) {
      this._showHeaders();
    }
  },

  _showHeaders : function() {
    this.$('.js-me-header').show();
    this.$('.js-following-header').show();
  }

});
