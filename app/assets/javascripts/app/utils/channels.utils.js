libs.utils.channels = {

  getCurrentChannel : function(){
    if (shelby.models.playlistManager.get('playlistType') == libs.shelbyGT.PlaylistType.channel) {
      return shelby.models.playlistManager.get('playlistRollId');
    } else {
      return null;
    }
  },

  getChannelName : function(channelId){
    var channel = shelby.config.channels[channelId];
    return channel['title'];
  }

};
