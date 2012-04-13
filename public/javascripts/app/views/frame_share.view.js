( function(){

  // shorten names of included library prototypes
  var ShareActionState = libs.shelbyGT.ShareActionState;

  libs.shelbyGT.FrameShareView = libs.shelbyGT.ShareView.extend({

    id: 'js-share-frame',

    className : 'frame-share rolling-frame-trans',

    _components : {
      networkToggles : true,
      shareButton : false,
      spinner : false
    },

    initialize : function(){
      this.options.frameRollingState.bind('change:doShare', this._onDoShareChange, this);
    },

    _cleanup : function(){
      this.options.frameRollingState.unbind('change:doShare', this._onDoShareChange, this);
    },

    saveUrl: function(){
      return [
        shelby.config.apiRoot + '/conversation/' + this.options.frame.get('conversation_id') + '/messages',
        shelby.config.apiRoot + '/frame/' + this.options.frame.id + '/share'
      ];
    },

    onShareSuccess: function(){
      var self = this;
      this.$('.share-comment').append(JST['shared-indicator']());
      setTimeout(function(){
        self.options.frameRollingState.set('doShare', ShareActionState.complete);
      }, 200);
    },

    onValidationFail : function(){
      this.options.frameRollingState.set('doShare', ShareActionState.failed);
    },

    _onDoShareChange: function(frameRollingStateModel, doShare){
      if (doShare == ShareActionState.share) {
        this._share();
      }
    }

  });

} ) ();