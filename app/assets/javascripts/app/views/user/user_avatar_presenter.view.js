/*
* Use this view to present a dynamic view of a user's avatar.  Works for users with new
* shelby avatars and without.
*
* This works well in conjunction with shelby.models.user and UserAvatarUplaoderView.
*
* You need to set the el within which this view renders and then renderChild.
*/

libs.shelbyGT.UserAvatarPresenterView = Support.CompositeView.extend({
  
  _avatarSize: null,
  
  template : function(obj){
    return JST['user/dynamic-avatar'](obj);
  },
  
  // The option avatarSize may be used to specify a different avatar asset (when user has a Shelby avatar).
  // libs.shelbyGT.UserAvatarSizes should be used to specify the size.
  initialize : function(){
    this.model = shelby.models.user;
    this._avatarSize = this.options.avatarSize || libs.shelbyGT.UserAvatarSizes.small;
    
    this.model.bind('change:avatar_updated_at', this._updateAvatar, this);
  },

  _cleanup : function(){
    this.model.unbind('change:avatar_updated_at', this._updateAvatar, this);
  },
  
  render : function(){
    this.$el.html(this.template({ 
      user: this.model,
      shelbyAvatarUrl: this._shelbyAvatarUrl()
      }));
  },
  
  _updateAvatar : function(){
    this.$(".user-avatar").attr("src", this._shelbyAvatarUrl());
  },
  
  _shelbyAvatarUrl: function(){
    if( this.model.get('has_shelby_avatar') ){
      return shelby.config.avatarUrlRoot+'/'+this._avatarSize+'/'+this.model.id+'?'+this.model.get('avatar_updated_at');
    } else {
      return null;
    }
  }
  
});