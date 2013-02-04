libs.shelbyGT.PlaylistManagerModel = Backbone.Model.extend({

  defaults : {
    nowSkippingVideo : false,
    playingFrameGroupCollection : null,
    playingRollId : null,
    playingState : libs.shelbyGT.PlayingState.none,
    preparedPlaylistCollection  : null
  }

});
