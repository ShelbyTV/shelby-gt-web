( function(){

  libs.shelbyGT.CommentOverlayView = Support.CompositeView.extend({

    el: '#js-comment-overlay',

    initialize : function(){
      this.model.bind('change:activeFrameModel', this._onActiveFrameModelChange, this);
    },
    
    render : function(frame){
      this.$el.html(this.template({frame:frame}));
    },

    _onActiveFrameModelChange : function(guide, activeFrameModel){
      var firstMessage = activeFrameModel.get('conversation').get('messages').first();
      var haveCreatorMessage = firstMessage && firstMessage.get('user_id') == activeFrameModel.get('creator_id');
      var haveWatchLaterMessage = firstMessage && (activeFrameModel.isOnRoll(shelby.models.user.get('watch_later_roll')));
      var useFrameCreatorInfo = !haveCreatorMessage && !haveWatchLaterMessage;
      var firstMessageViewParams = useFrameCreatorInfo ? {frame:activeFrameModel} : {model:firstMessage};
      var firstMessageView = new libs.shelbyGT.MessageView(firstMessageViewParams);
      this._leaveChildren();
      this.insertChildBefore(firstMessageView, '.comment-overlay-next');
    }

  });

} ) ();
