(function(){

  libs.shelbyGT.UserProgressModel = libs.shelbyGT.ShelbyBaseModel.extend({

    initialize : function(){
      console.log('init user prog');
      shelby.models.guide.bind('change:displayState', this._onDisplayStateChange, this);
      shelby.models.guide.bind('change:activeFrameRollingView', this._onActiveFrameRollingViewChange, this);
      this.bind('change', function(){
        console.log('set');
      });
    },

    _onDisplayStateChange : function(guide, displayState){
      this.set(displayState+'_nav', true);
    },

    _onActiveFrameRollingViewChange : function(guide, frameRollingView){
      this.set('rollFrame_init', true);
    }

  });

})();
