(function(){

  libs.shelbyGT.AppProgressModel = libs.shelbyGT.ShelbyBaseModel.extend({

    defaults : {
      'dashboardEducated' : false,
      'rollEducated' : false,
      'rollListEducated' : false,
      'browseRollListEducated' : false,
      'standardRollEducated' : false,
      'streamEducated' : false,
      'rollNav' : false,
      'rollListNav' : false,
      'streamNav' : false
    },

    initialize : function(){
      shelby.models.guide.bind('change:displayState', this._onDisplayStateChange, this);
      this.bind('change', this._onStateChange, this);
    },

    saveMe : function(){
      shelby.models.user.save({app_progress:this.toJSON()});
    },

    reset : function(){
      this.set(_.clone(this.defaults));
    },
    
    // save all state changes
    _onStateChange : function(){
      shelby.models.user.save({app_progress:this.toJSON()});
    },

    // display states
    _onDisplayStateChange : function(guide, displayState){
      this.set(displayState+'Nav', true);
    },
    
    // rolling initialized 
    // XXX Rolling has been simplified, no longer tracking the views that old way

  });

})();
