libs.shelbyGT.ExploreLayoutView = Support.CompositeView.extend({

  el: '.js-explore-layout',

  _spinnerView : null,

  _spinnerState : null,

  template : function(obj){
      return JST['explore-layout'](obj);
  },

  initialize : function(){
    shelby.models.exploreGuide.bind('showSpinner', this._onShowSpinner, this);
    shelby.models.exploreGuide.bind('hideSpinner', this._onHideSpinner, this);
  },

  _cleanup : function(){
    shelby.models.exploreGuide.unbind('showSpinner', this._onShowSpinner, this);
    shelby.models.exploreGuide.unbind('hideSpinner', this._onHideSpinner, this);
  },

  render : function(){
    this.$el.html(this.template());
    this.renderChild(new libs.shelbyGT.SmartRefreshListView({
      collectionAttribute : 'roll_categories',
      doCheck : libs.shelbyGT.SmartRefreshCheckType.key,
      doSmartRefresh : true,
      el : '.js-roll-category-list',
      keyAttribute : 'category',
      listItemViewAdditionalParams : {
        activationStateModel : shelby.models.exploreGuide,
        exploreGuideModel : shelby.models.exploreGuide
      },
      listItemView : 'RollCategoryItemView',
      model : shelby.models.exploreRollCategories
    }));
    this.renderChild(new libs.shelbyGT.ExploreContentPaneView({model:shelby.models.exploreGuide}));
    this._spinnerState = new libs.shelbyGT.SpinnerStateModel();
    this._spinnerView = new libs.shelbyGT.SpinnerView({
      model : this._spinnerState,
      el : '.js-guide-explore',
      size : 'large-light'
    });
    this.renderChild(this._spinnerView);
  },

  _onShowSpinner : function() {
    this._spinnerState.set('show', true);
  },

  _onHideSpinner : function() {
    this._spinnerState.set('show', false);
  }

});