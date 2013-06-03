libs.shelbyGT.UserPreferencesView = Support.CompositeView.extend({

  _responseFadeTimeout : null,

  _securityResponseFadeTimeout : null,

  events: {
    "click .js-preferences-navigate" : "_navigateSection"
  },

  _container : '.js-preferences-section', //for children views

  el: '.js-preferences-layout',

  template : function(obj){
    return SHELBYJST['user-preferences'](obj);
  },

  render : function(section){
    this.$el.html(this.template({user:this.model,section: section}));
  },

  initialize : function(){
    this.options.viewModel.bind('change:section', this._onSectionChange, this);
  },

  _cleanup : function(){
    this.options.viewModel.unbind('change:section', this._onSectionChange, this);
  },

  _onSectionChange : function(model,section,opts) {
    //destroy children
    this._leaveChildren();

    //re-render (aka update menu as per selected section)
    this.render(section);

    //render selected section
    switch(section) {
      case 'profile':
        console.log('---render profile');
        this.renderChildInto(new libs.shelbyGT.UserPreferencesProfileView(),this._container);
        break;
      case 'password':
        console.log('---render password');
        this.renderChildInto(new libs.shelbyGT.UserPreferencesPasswordView(),this._container);
        break;
      case 'networks':
        console.log('---render networks');
        this.renderChildInto(new libs.shelbyGT.UserPreferencesNetworksView(),this._container);
        break;
      case 'notifications':
        console.log('---render notifications');
        this.renderChildInto(new libs.shelbyGT.UserPreferencesNotificationsView(),this._container);
        break;
      case 'goodies':
        console.log('---render goodies');
        this.renderChildInto(new libs.shelbyGT.UserPreferencesGoodiesView(),this._container);
        break;
    }
  },

  _navigateSection : function(e) {
    e.preventDefault();
    shelby.router.navigate(e.currentTarget.pathname,{trigger:true});
  }

});