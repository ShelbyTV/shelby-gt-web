libs.shelbyGT.viewHelpers.roll = {
	titleWithPath : function(roll){
		return this.pathForDisplay(roll)+"/"+this.titleWithoutPath(roll);
	},
	
	pathForDisplay : function(roll){
		return roll.get('creator_nickname');
	},
	
	titleWithoutPath : function(roll){
		if(roll.get('roll_type') == libs.shelbyGT.RollModel.TYPES.special_hearted){
      return "Liked";
    }
    else if(roll.get('roll_type') == libs.shelbyGT.RollModel.TYPES.special_watch_later){
      return "Queue";
    }
		else if(roll.get('roll_type') == libs.shelbyGT.RollModel.TYPES.special_public){
			return "Personal Roll";
    } 
		else {
      return roll.get('title');
    }
		return '';
	},
	
	urlForRoll : function(roll){
		if(roll.get('roll_type') == libs.shelbyGT.RollModel.TYPES.special_public){
			return roll.get('subdomain') + '.shelby.tv';
    } else {
			return null;
		}
	},
	
  titleForDisplay : function(roll){
    if(roll.get('roll_type') == libs.shelbyGT.RollModel.TYPES.special_hearted){
      return "Liked";
    }
    else if(roll.get('roll_type') == libs.shelbyGT.RollModel.TYPES.special_watch_later){
      return "Queue";
    }
    else if(shelby.models.user && roll.id == shelby.models.user.get('personal_roll_id') && roll.get('subdomain')){
      return roll.get('subdomain') + '.shelby.tv';
		} 
		else if(roll.get('roll_type') == libs.shelbyGT.RollModel.TYPES.special_public){
			return "Personal Roll";
    } else {
      return roll.get('title');
    }
  }
};