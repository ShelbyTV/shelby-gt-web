libs.shelbyGT.UserProfileInfoView = Support.CompositeView.extend({

  events: {
  },

  template : function(obj){
    return SHELBYJST['user-profile-info'](obj);
  },

  initialize : function(){
    this.model.bind('change:currentUser', this._onCurrentUserChange, this);
    if (this.model.has('currentUser')) {
      this.model.get('currentUser').bind('change', this.render, this);
    }
  },

  _cleanup : function(){
   this.model.unbind('change:currentUser', this._onCurrentUserChange, this);
   if (this.model.has('currentUser')) {
      this.model.get('currentUser').unbind('change', this.render, this);
    }
  },

  render : function(){
    this.$el.html(this.template({user:this.model.get('currentUser')}));
  },

  _onCurrentUserChange : function(userProfileModel, currentUser) {
    this.render();
    if (currentUser) {
      currentUser.bind('change', this.render, this);
    }
    var previousUser = userProfileModel.previous('currentUser');
    if (previousUser) {
      previousUser.unbind('change', this.render, this);
    }
  }

});