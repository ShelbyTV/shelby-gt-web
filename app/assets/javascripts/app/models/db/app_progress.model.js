(function(){

  libs.shelbyGT.AppProgressModel = libs.shelbyGT.ShelbyBaseModel.extend({

    defaults : {
      /*'dashboardEducated' : false,
      'rollEducated' : false,
      'rollListEducated' : false,
      'browseRollListEducated' : false,
      'standardRollEducated' : false,
      'streamEducated' : false,
      'rollNav' : false,
      'rollListNav' : false,
      'streamNav' : false,*/
      'onboarding' : false,
      //has this user seen and dismissed the extension/bookmarket notification?
      'extension' : false
    },

    //assuming that parameter stage is an integer
    advanceStage : function(attribute, stage) {
      var value = this.get(attribute);
      //don't let the stage of progress move backwards
      if (!value || value < stage) {
        this.set(attribute, stage);
        this.saveMe();
      }
    },
    
    hasCompletedOnboarding : function(){
      return this.get('onboarding') == 4;
    },

    saveMe : function(){
      shelby.models.user.save({app_progress:this.toJSON()});
    },

    reset : function(){
      this.set(_.clone(this.defaults));
    }

  });

})();
