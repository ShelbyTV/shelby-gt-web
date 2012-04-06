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
    message.set('text',this.model.get('text'));
    message.save(null, this._getCommentOpts());
    return false;
  },

  _onCommentSuccess : function(conversation){
    console.log(conversation, 'convo', (typeof conversation), 'len', conversation.length);
    this.options.frame.set('conversation', conversation)
    console.log('share model ==', this.model);
    //uncomment to share for realsies
    //this.model.save(null, this._getShareOpts());
    var self = this;
    setTimeout(function(){
      self._onShareSuccess();
    }, 400);
  },

  _onShareSuccess : function(data){
    var self = this;
    console.log('share success', data);
    this._clearTextArea(); //hmm this should be shared for all inheritors...
    this.$('.share-comment').append(JST['shared-indicator']());
    setTimeout(function(){
      self.parent.parent._goBack();
    }, 200);
  },

  _getShareOpts : function(){
    var self = this;
    return {
      url : shelby.config.apiRoot + '/frame/' +self.options.frame.id + '/share',
      success : function(data){
        self._onShareSuccess(data);
      },
      error : function(){
        console.log('sharing failed - bug fix needed');
      }
    };
  },

  _getCommentOpts : function(){
    var self = this;
    return {
      url : shelby.config.apiRoot + '/conversation/' +self.options.frame.get('conversation_id') + '/messages',
      success : function(data){
        self._onCommentSuccess(data);
      },
      error : function(){
        console.log('commenting failed - bug fix needed');
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
