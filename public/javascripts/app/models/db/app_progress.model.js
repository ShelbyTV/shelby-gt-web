(function(){

  libs.shelbyGT.AppProgressModel = libs.shelbyGT.ShelbyBaseModel.extend({

    defaults : {
      'dashboardEducated' : false,
      'rollEducated' : false,
      'rollListEducated' : false,
      'standardRollEducated' : false,
      'streamEducated' : false,
      'rollNav' : false,
      'rollListNav' : false,
      'streamNav' : false,
      'framesRolled' : 0
    },

    initialize : function(){
      shelby.models.guide.bind('change:displayState', this._onDisplayStateChange, this);
      shelby.models.guide.bind('change:activeFrameRollingView', this._onActiveFrameRollingViewChange, this);
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
    _onActiveFrameRollingViewChange : function(guide, frameRollingView){
      this.set('rollFrameInit', true);
    }

  });

})();
