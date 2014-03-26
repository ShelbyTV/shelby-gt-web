libs.shelbyGT.UserPreferencesSourcesView = libs.shelbyGT.UserPreferencesBaseView.extend({

  className: 'content_lining preferences_page preferences_page--sources',

  options : _.extend({}, libs.shelbyGT.UserPreferencesBaseView.prototype.options, {}),

  template : function(obj){
      return SHELBYJST['preferences-sources'](obj);
  },

  render : function(){
    this.$el.html(this.template());

    var _rollCategories = [];

    if (this.options.rollCategories && this.options.rollCategories.get('roll_categories').models.length > 0 && this.options.rollCategories.get('roll_categories').models[0].has('rolls')){
      _rollCategories = this.options.rollCategories.get('roll_categories').models[0].get('rolls').models;

      this.appendChildInto(new libs.shelbyGT.FollowSourcesView({
        clickableUser: true,
        context: 'Preferences',
        model : new libs.shelbyGT.FollowSourcesModel(),
        rollCategories: _rollCategories
      }), '.js-sources-list--preferences');
    }

  },

  initialize : function(){
    this.options.rollCategories.fetch();
    this.options.rollCategories.get('roll_categories').bind('reset', this.render, this);
  },

  _cleanup : function(){
    this.options.rollCategories.get('roll_categories').unbind('reset', this.render, this);
  }

});
