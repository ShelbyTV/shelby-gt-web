/*
* Use this view to present a dynamic view of a user's avatar.  Works for users with new
* shelby avatars and without.
*
* This works well in conjunction with shelby.models.user and UserAvatarUplaoderView.
*
* You need to set the el within which this view renders and then renderChild.
*/

libs.shelbyGT.UserAvatarPresenterView = Support.CompositeView.extend({

  // The option avatarSize may be used to specify a different avatar asset (when user has a Shelby avatar).
  // libs.shelbyGT.UserAvatarSizes should be used to specify the size.
  options : {
    avatarSize : libs.shelbyGT.UserAvatarSizes.small,
    template : 'user/dynamic-avatar', // path to the template used to render the view
    imgAttribute : 'src', //html attribute to modify to update the avatar image
    imgSelector : '.js-user-avatar', //html element to modify to update the avatar image
    imgValTemplate : '<%= url %>' // underscore template to interpolate with the avatar url and then assign to the imgAttibute
  },

  template : function(obj){
    return SHELBYJST[this.options.template](obj);
  },

  initialize : function(){
    this.model.bind('change:avatar_updated_at change:has_shelby_avatar', this._updateAvatar, this);
  },

  _cleanup : function(){
    this.model.unbind('change:avatar_updated_at change:has_shelby_avatar', this._updateAvatar, this);
  },

  render : function(){
    this.$el.html(this.template({
      user: this.model,
      shelbyAvatarUrl: this._shelbyAvatarUrl()
      }));
  },

  _updateAvatar : function(){
    this.$(this.options.imgSelector).attr(this.options.imgAttribute, _.template(this.options.imgValTemplate, {url: this._shelbyAvatarUrl()}));
  },

  _shelbyAvatarUrl: function(){
    if( this.model.get('has_shelby_avatar') ){
      return shelby.config.avatarUrlRoot+'/'+this.options.avatarSize+'/'+this.model.id+'?'+(new Date(this.model.get('avatar_updated_at')).getTime());
    } else {
      return libs.shelbyGT.viewHelpers.user.avatarUrl(this.model);
    }
  }

});