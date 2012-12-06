libs.shelbyGT.viewHelpers.roll = {
  titleWithPath : function(roll){
    return this.pathForDisplay(roll)+"/"+this.titleWithoutPath(roll);
  },

  pathForDisplay : function(roll){
    return roll.get('creator_nickname');
  },

  capitalizeFirstLetter : function(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
  },

  titleWithoutPath : function(roll, options){
    // default options
    options = _.chain({}).extend(options).defaults({
      creatorNickname : ''
    }).value();

    var rollName;

    if(roll.get('roll_type') == libs.shelbyGT.RollModel.TYPES.special_hearted){
      rollName = "Likes";
    }
    else if(roll.get('roll_type') == libs.shelbyGT.RollModel.TYPES.special_watch_later){
      rollName = "Queue";
    }
    else if(
      roll.get('roll_type') == libs.shelbyGT.RollModel.TYPES.special_public_real_user ||
      roll.get('roll_type') == libs.shelbyGT.RollModel.TYPES.special_public_upgraded ){
      rollName = "Personal Roll";
    }
    else if(libs.shelbyGT.viewHelpers.roll.isFaux(roll)){
      // faux rolls will only have frames from one network
      if(roll.get('origin_network') && roll.get('creator_nickname')){
        rollName = libs.shelbyGT.viewHelpers.roll.capitalizeFirstLetter(roll.get('origin_network')) + " Shares";
      }
      else {
        return roll.get('title');
      }
    }
    else {
      return roll.get('title');
    }
    if (options.creatorNickname && options.creatorNickname != shelby.models.user.get('nickname')) {
      return options.creatorNickname + "'s " + rollName;
    } else {
      return rollName;
    }
  },

  urlForRoll : function(roll){
    if(
      roll.get('roll_type') == libs.shelbyGT.RollModel.TYPES.special_public ||
      roll.get('roll_type') == libs.shelbyGT.RollModel.TYPES.special_public_real_user ||
      roll.get('roll_type') == libs.shelbyGT.RollModel.TYPES.special_public_upgraded ){
      return roll.get('subdomain') + '.shelby.tv';
    } else {
      return null;
    }
  },

  titleForDisplay : function(roll){
    if(roll.get('roll_type') == libs.shelbyGT.RollModel.TYPES.special_hearted){
      return "Likes";
    }
    else if(roll.get('roll_type') == libs.shelbyGT.RollModel.TYPES.special_watch_later){
      return "Queue";
    }
    else if(shelby.models.user && roll.id == shelby.models.user.get('personal_roll_id') && roll.get('subdomain')){
      return roll.get('subdomain') + '.shelby.tv';
    }
    else if(shelby.models.user && roll.id == shelby.models.user.get('personal_roll_id')){
      return "Personal Roll";
    }
    else if(libs.shelbyGT.viewHelpers.roll.isRealUserRoll(roll)){
      return roll.get('creator_nickname') || roll.get('title');
    }
    else if(libs.shelbyGT.viewHelpers.roll.isFaux(roll)){
      // faux rolls will only have frames from one network
      if(roll.get('origin_network') && roll.get('creator_nickname')){
        return roll.get('creator_nickname') + "'s " + libs.shelbyGT.viewHelpers.roll.capitalizeFirstLetter(roll.get('origin_network')) + " Shares";
      }
      else {
        return roll.get('title');
      }
    }
    else {
      return roll.get('title');
    }
  },

  isRealUserRoll : function(roll){
    return roll &&
    (roll.get('roll_type') == libs.shelbyGT.RollModel.TYPES.special_public_real_user ||
     roll.get('roll_type') == libs.shelbyGT.RollModel.TYPES.special_public_upgraded);
  },

  isFaux : function(roll){
    return roll &&
    (roll.get('roll_type') == libs.shelbyGT.RollModel.TYPES.special_public ||
     roll.get('roll_type') == libs.shelbyGT.RollModel.TYPES.special_roll);
  },
  
  guideHeaderImageURL : function(roll){
    if(roll.has('header_image_file_name')){
      return  shelby.config.rollImagesUrlRoot+'/header/'+roll.id+'/guide_wide/'+roll.get('header_image_file_name');
    } else {
      //consistently index 5 default images, sequentially named (ie: 0.jpg, 1.jpg, 2.jpg...)
      return '/images/assets/roll_headers/'+parseInt(roll.id, 16)%5+'.jpg';
    }
  }
  
};
