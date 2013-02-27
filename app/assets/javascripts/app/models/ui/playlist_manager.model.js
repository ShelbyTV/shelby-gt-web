libs.shelbyGT.PlaylistManagerModel = Backbone.Model.extend({

  // Keeps track of the current playlist, which is used by the PlaylistManagerView,
  // when a video ends or the user hits forward or back, to determine which video
  // should be played next

  // The playlist itself is really just the frameGroupCollection of a FrameGroupPlayPagingListView,
  // which is the component used by the application to display the contents of a roll, dashboard, search results,
  // or any other list of videos that can be played in the shelby web app

  defaults : {
    nowSkippingVideo : false, // are we currently in the process of skipping forward or back in the playlist
    playlistFrameGroupCollection : null, // the collection of frame groups that is the current playlist
    playlistRollId : null, // the id of the roll that the playlist contents come from - only relevant when the playlistType is 'roll'
    playlistType : libs.shelbyGT.PlaylistType.none // where does the current playlist come from: roll, dashboard, etc?
  }

});
