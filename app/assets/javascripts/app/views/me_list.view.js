libs.shelbyGT.MeListView = Support.CompositeView.extend({

  tagName : 'ul',

  className : 'group_list_module me-section',

  template : function(obj){
    return SHELBYJST['me-list'](obj);
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
      doStaticRender : true,
      rollListFilterType : libs.shelbyGT.RollListFilterType.me
    }), '.js-me-rolls-list');
    this.appendChildInto(new libs.shelbyGT.RollListView({
      comparator : function(roll) {
        return roll.get('title').toLowerCase();
      },
      model : this.model,
      doStaticRender : true,
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
