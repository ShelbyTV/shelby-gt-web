libs.shelbyGT.UserPreferencesView = Support.CompositeView.extend({

  _responseFadeTimeout : null,

  _securityResponseFadeTimeout : null,

  events: {
    "click .js-preferences-navigate" : "_navigateSection",
    "keyup .form_input"              : "cleanUpErrors"
  },

  _container : '.js-preferences-section', //for children views

  el: '.js-preferences-layout',

  template : function(obj){
    return SHELBYJST['user-preferences'](obj);
  },

  render : function(section){
    this.$el.html(this.template({
      user:this.model,
      section: section
    }));
  },

  initialize : function(){
    this.options.viewModel.bind('change:section', this._onSectionChange, this);
  },

  cleanUpErrors: function(e) {
    $(e.currentTarget).parent().removeClass('form_fieldset--error');
  },

  _cleanup : function(){
    this.options.viewModel.unbind('change:section', this._onSectionChange, this);
  },

  _onSectionChange : function(model,section,opts) {
    //destroy children
    this._leaveChildren();

    //re-render (aka update menu as per selected section)
    this.render(section);


    //all the children views inherit the same data
    var viewData = {
      model: this.model
    };

    //render selected section
    switch(section) {
      case 'profile':
        this.renderChildInto(new libs.shelbyGT.UserPreferencesProfileView(viewData),this._container);
        break;
      case 'password':
        this.renderChildInto(new libs.shelbyGT.UserPreferencesPasswordView(viewData),this._container);
        break;
      case 'networks':
        this.renderChildInto(new libs.shelbyGT.UserPreferencesNetworksView(viewData),this._container);
        break;
      case 'notifications':
        this.renderChildInto(new libs.shelbyGT.UserPreferencesNotificationsView(viewData),this._container);
        break;
      case 'goodies':
        this.renderChildInto(new libs.shelbyGT.UserPreferencesGoodiesView(viewData),this._container);
        break;
    }
  },

  _navigateSection : function(e) {
    e.preventDefault();

    var href = e.currentTarget.pathname;

    shelby.router.navigate(href,{trigger:true});
  }

});