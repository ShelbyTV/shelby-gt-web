/*
 * JSTs aren't the place to do all sorts of fancy logic for displaying FrameGroups.
 *
 * This should help to DRY them up.
 */
libs.shelbyGT.viewHelpers.frameGroup = {

  contextAppropriatePermalink: function(frameGroup){
    var dbEntry = frameGroup.get('primaryDashboardEntry');
    if (dbEntry) {
      var dbEntryUserId = dbEntry.get('user_id');
      // if we're on a channel, share a link that will bring the user to this entry on the channel
      var channelPair = _(shelby.config.channels).chain().pairs().find(function(channelPair){
        return channelPair[1].id == dbEntryUserId;
      }).value();
      if (channelPair) {
        return 'http://shelby.tv/channels/' + channelPair[0] + '/' + dbEntry.id;
      }
    }

    // otherwise share a link that will bring the user to this frame on its home roll
    return libs.shelbyGT.viewHelpers.frame.permalink(frameGroup.get('frames').at(0));
  }

};