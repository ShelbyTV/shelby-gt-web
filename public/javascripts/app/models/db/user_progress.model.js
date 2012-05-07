(function(){

  libs.shelbyGT.UserProgressModel = libs.shelbyGT.ShelbyBaseModel.extend({

    defaults : {
      'rollEducated' : false,
      'rollListEducated' : false,
      'streamEducated' : false,
      'savesEducated' : false
    },

    initialize : function(){
      shelby.models.guide.bind('change:displayState', this._onDisplayStateChange, this);
      shelby.models.guide.bind('change:activeFrameRollingView', this._onActiveFrameRollingViewChange, this);
    },

    // display states
    _onDisplayStateChange : function(guide, displayState){
      this.set(displayState+'Nav', true);
    },
    
    // rolling initialized
    _onActiveFrameRollingViewChange : function(guide, frameRollingView){
      console.log('_onActiveFrameRollingViewChange');
      this.set('rollFrameInit', true);
    }

    // rolling complete


  });

})();
