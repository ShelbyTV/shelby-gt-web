libs.shelbyGT.FrameShareView = libs.shelbyGT.ShareView.extend({

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

  onShareSuccess: function(){
    var self = this;
    this.$('.share-comment').append(JST['shared-indicator']());
    setTimeout(function(){
      self.parent.parent._goBack();
    }, 200);
  }

});
