/*
* Shelby user's may have avatars from a third party, or they may have uploaded an avatar to Shelby directly.
* And messages may also capture user's avatars which may be either of the above.
*
* Use these helpers whenever you need an avatar (for User or Message) and it will take care of all cases.
*/
libs.shelbyGT.viewHelpers.user = {
  
  undefinedAvatarUrl: "/images/assets/avatar.png",
  
  // Use this when you have a User
  // see libs.shelbyGT.UserAvatarSizes for size options (will be respected only for Shelby avatars)
  avatarUrl: function(user, avatarSize){
    avatarSize = avatarSize || libs.shelbyGT.UserAvatarSizes.small;
    if( !user ){
      return libs.shelbyGT.viewHelpers.user.undefinedAvatarUrl;
    } else if( user.get('has_shelby_avatar') ){
      return shelby.config.avatarUrlRoot+'/'+avatarSize+'/'+user.id+'?'+Date.parse(user.get('avatar_updated_at'));
    } else {
      return user.get('user_image_original') || user.get('user_image') || libs.shelbyGT.viewHelpers.user.undefinedAvatarUrl;
    }
  },
  
  // Use this to get the avatar when you have a message and don't necessarily have the messages creator object
  // see libs.shelbyGT.UserAvatarSizes for size options (will be respected only for Shelby avatars)
  avatarUrlForMessage: function(message, avatarSize){
    avatarSize = avatarSize || libs.shelbyGT.UserAvatarSizes.small;
    
    if( message && message.get('user_has_shelby_avatar') ) {
      return shelby.config.avatarUrlRoot+'/'+avatarSize+'/'+message.get('user_id');
    } else if( message && message.get('user_image_url') ){
      return message.get('user_image_url');
    } else {
      return libs.shelbyGT.viewHelpers.user.undefinedAvatarUrl;
    }
  }
  
};