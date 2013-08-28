libs.shelbyGT.UserPreferencesSourcesView = libs.shelbyGT.UserPreferencesBaseView.extend({

  events : {
  },

  className: 'content_lining preferences_page preferences_page--sources',

  options : _.extend({}, libs.shelbyGT.UserPreferencesBaseView.prototype.options, {}),

  template : function(obj){
      return SHELBYJST['preferences-sources'](obj);
  },

  render : function(){
    this.$el.html(this.template({
      rollCategories : this.options.rollCategories.get('roll_categories')
    }));
    this.appendChild(new libs.shelbyGT.OnboardingView.onboardingStages.view[libs.shelbyGT.OnboardingFollowSourcesView](), '.js-sources-list');
  },

  initialize : function(){
    this._preferences = this.model.get('preferences');
    console.log('--------');
  },

  _cleanup : function(){
  }

});
