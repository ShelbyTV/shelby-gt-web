libs.utils.channels = {

  getCurrentChannel : function(){
    if (shelby.models.guide.get('displayState') == libs.shelbyGT.DisplayState.channel) {
      // if we're showing a channel in the guide, that channel is either being played
      // or waiting to be played as soon as the channel data finishes downloading,
      // so that's the current channel
      return shelby.models.guide.get('currentChannelId');
    } else if (shelby.models.playlistManager.get('playingState') == libs.shelbyGT.PlayingState.channel) {
      // if there's no channel shown in the guide, we may still be playing a channel
      // if so, that's the current channel
      return shelby.models.playlistManager.get('playingChannelId');
    } else {
      // otherwise, there is no current channel
      return null;
    }
  }

};