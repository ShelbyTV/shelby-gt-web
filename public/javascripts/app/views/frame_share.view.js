libs.shelbyGT.FrameShareView = libs.shelbyGT.ShareView.extend({

  id: 'js-share-frame',

  className : 'frame-share rolling-frame-trans',

  _components : {
    networkToggles : true,
    shareButton : false,
    spinner : false
  },

  _share : function(){
    var self = this;
    if(!this._validateShare()) return false;
    console.log('commenzting', this.model.get('comment'), 'to comment');
    var message = new libs.shelbyGT.MessageModel();
    message.set('text',this.model.get('comment'));
    message.save(null, this._getSaveOpts());
    return false;
  },

  _onShareSuccess : function(){
    var self = this;
    this._clearTextArea(); //hmm this should be shared for all inheritors...
    // this._displayOverlay(function(){
    //   self.$el.slideToggle(function(){
    //     self.$('.video-shared').remove();
    //   });
    // });
  },

  // Compulsory if _components.spinner

  // Non-compulsory

  _getSaveOpts : function(){
    var self = this;
    return {
      url : shelby.config.apiRoot + '/conversation/' +self.options.frame.get('conversation_id') + '/messages',
      success : function(){
        self._onShareSuccess();
      },
      error : function(){
        console.log('sharing failed - bug fix needed');
      }
    };
  },

  //callback to be called when fading is done
  _displayOverlay : function(cb){
    this.$('.share-comment').append(JST['shared-indicator']());
    setTimeout(function(){
      cb();
    }, 700);
  }

});
