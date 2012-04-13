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
    var formValid = true;
    if(!this._validateShare()) {
      $('.js-share-textarea').addClass('error');
      formValid = false;
    }
    var title = this.options.roll.get('title');
    if(!(title && title.length)) {
      this.parent.$('.js-new-roll-name-input').addClass('error');
      formValid = false;
    }
    if (!formValid) {
      this.onValidationFail();
      return false;
    } else {
      $('.js-share-textarea').removeClass('error');
      this.parent.$('.js-new-roll-name-input').removeClass('error');
    }
    this._components.spinner && this._showSpinner();
    // have to create the roll and reroll the frame before we can share
    this.options.roll.save(null, {
      success : function(newRoll){
        self.options.frame.reRoll(newRoll, function(newFrame){
          self.options.frame = newFrame;
          libs.shelbyGT.FrameShareView.prototype._share.call(self);
        });
      }});

    return false;
  }

});
