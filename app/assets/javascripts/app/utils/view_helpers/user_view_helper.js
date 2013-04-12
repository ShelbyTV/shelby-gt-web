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
      //using .get('id') for extension compatibility
      return shelby.config.avatarUrlRoot+'/'+avatarSize+'/'+user.get('id')+'?'+(new Date(user.get('avatar_updated_at')).getTime());
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
  },

  // Use this to get the avatar for a roll creator when you have a roll
  // see libs.shelbyGT.UserAvatarSizes for size options (will be respected only for Shelby avatars)
  avatarUrlForRoll: function(roll, avatarSize){
    avatarSize = avatarSize || libs.shelbyGT.UserAvatarSizes.small;

    if( roll && roll.get('creator_has_shelby_avatar') ) {
      return shelby.config.avatarUrlRoot+'/'+avatarSize+'/'+roll.get('creator_id')+'?'+(new Date(roll.get('creator_avatar_updated_at')).getTime());
    } else if( roll && roll.get('thumbnail_url') ){
      return roll.get('thumbnail_url');
    } else {
      return libs.shelbyGT.viewHelpers.user.undefinedAvatarUrl;
    }
  },

  // use this to get the nickname of a faux user on their origin network,
  // NOT the nickname they are assigned in Shelby
  userOriginNickname: function(user){
    var userAuths = user.get('authentications');
    if (userAuths && userAuths.length) {
      return userAuths[0].nickname;
    } else {
      return null;
    }
  }

};