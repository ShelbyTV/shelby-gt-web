libs.shelbyGT.viewHelpers.roll = {
  titleForDisplay : function(roll){
    if(roll.get('roll_type') == libs.shelbyGT.RollModel.TYPES.special_hearted){
      return "Hearts";
    }
    else if(roll.get('roll_type') == libs.shelbyGT.RollModel.TYPES.special_watch_later){
      return "Watch Later";
    }
    else if(shelby.models.user && roll.id == shelby.models.user.get('personal_roll_id') && roll.get('subdomain')){
      return roll.get('subdomain') + '.shelby.tv';
    } else {
      return roll.get('title');
    }
  }
};