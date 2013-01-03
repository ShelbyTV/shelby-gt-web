libs.shelbyGT.PlaylistManagerView = Support.CompositeView.extend({

  initialize : function(){
    shelby.models.userDesires.bind('change:changeVideo', this._onChangeVideo, this);
    Backbone.Events.bind('playback:next', this._onPlaybackNext, this);
  },

  _cleanup : function() {
    shelby.models.userDesires.unbind('change:changeVideo', this._onChangeVideo, this);
    Backbone.Events.unbind('playback:next', this._onPlaybackNext, this);
  },

  _setPlayingFrameGroupCollection : function(pfgc){
    this.model.set('playingFrameGroupCollection', pfgc);
  },

  _onChangeVideo : function(userDesiresModel, videoChangeValue){
    if (userDesiresModel.has('changeVideo')) {
      this._skipVideo(videoChangeValue);
    }
  },

  _onPlaybackNext : function(){
    this._skipVideo(1);
  },

  // appropriately changes the next video (in dashboard or a roll)
  _skipVideo : function(skip){

    // if we can't find a playable frame in the direction we're looking
    // we return to the beginning of the roll or stream
    var nextFrame = this.model.get('playingFrameGroupCollection').getNextPlayableFrame(this.options.guideModel.get('activeFrameModel'), skip, true);

    this.model.set('nowSkippingVideo', true);
    this.options.guideModel.set({activeFrameModel: nextFrame});
    this.model.set('nowSkippingVideo', false);
  }

});