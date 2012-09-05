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
      'onboarding' : false
    },

    initialize : function(){
    },

    saveMe : function(){
      shelby.models.user.save({app_progress:this.toJSON()});
    },

    reset : function(){
      this.set(_.clone(this.defaults));
    }

  });

})();
