libs.shelbyGT.FrameRollingNewRollView = libs.shelbyGT.FrameShareView.extend({

  id: 'js-share-frame',

  className : 'frame-share rolling-frame-trans',

  _components : {
    networkToggles : true,
    shareButton : false,
    spinner : false
  },

  saveUrl: function(){
    return [
      shelby.config.apiRoot + '/conversation/' + this.options.frame.get('conversation_id') + '/messages',
      shelby.config.apiRoot + '/frame/' + this.options.frame.id + '/share'
    ];
  },

  _share : function(){
    var self = this;
    var title = this.options.roll.get('title');
    if(!(this._validateShare() && title && title.length)) return false;
    this._components.spinner && this._toggleSpinner();
    // have to create the roll and reroll the frame before we can share
    this.options.roll.save(null, {
      success : function(newRoll){
        self.options.frame.reRoll(newRoll, function(newFrame){
          self.options.frame = newFrame;
          libs.shelbyGT.FrameShareView.prototype._share.call(self);
        });
      }});

    return false;
  },

  onShareSuccess: function(){
    var self = this;
    this.$('.share-comment').append(JST['shared-indicator']());
    setTimeout(function(){
      self.parent.parent._hide();
    }, 200);
  }

});
