libs.shelbyGT.PlaylistManagerModel = Backbone.Model.extend({

  defaults : {
    nowSkippingVideo : false,
    playingChannelId : null,
    playingFrameGroupCollection : null,
    playingRollId : null,
    playingState : libs.shelbyGT.PlayingState.none,
    preparedPlaylistCollection  : null
  }

});
