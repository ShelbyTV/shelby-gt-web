/*
 * JSTs aren't the place to do all sorts of fancy logic for displaying Frames.
 *
 * This should help to DRY them up.
 */
libs.shelbyGT.viewHelpers.frame = {

  getMessages: function(frameModel){
    return ((frameModel.get('conversation') && frameModel.get('conversation').get('messages')) || new Backbone.Collection());
  },

  //is frame lightweight?
  isLightWeight: function(frameModel) {
    return (frameModel.get('frame_type') == libs.shelbyGT.FrameModel.FRAME_TYPE.light_weight);
  },

  // //formats the classname modifier: should an avatar have a special badge?
  // avatarModifier: function(model){
  //   var modifier = '';



  //   return modifier;
  // }

  /*
   * Mimicks the same permalink you would get from the backend, except
   * this will not be shortened.
   *
   */
  permalink: function(frame){
    if (shelby.config.whitelabel.isWhitelabeled()) {
      // if we're whitelabeled, and the frame has an original_source_url from the whitelabel partner, use that
      // as the permalink
      if (frame.has('original_source_url')) {
        return frame.get('original_source_url');
      }
    }

    if( frame.has('creator') ){
      return this._subdomainPermalink(frame);
    } else {
      return this._videoPagePermalink(frame);
    }
  },

  title: function(frame) {
    var frameTitle;
    if (shelby.config.whitelabel.mode == shelby.config.whitelabel.MODES.cheez) {
        // for Cheezburger, the comment is the title that they use for the video on their site, so make that
        // the title instead of the provider's video title
        var firstMessage = frame.get('conversation') && frame.get('conversation').get('messages').first()
        if (firstMessage) {
            frameTitle = firstMessage.get('text');
        }
    }
    // in any other case, the title is just the title of the video
    return frameTitle || frame.get('video').get('title');
  },

  _subdomainPermalink: function(frame){
    return 'http://shelby.tv/'+frame.get('creator').get('nickname')+'/shares/'+frame.id;
  },

  _isolatedRollPermalink: function(frame){
    return 'http://shelby.tv/isolated-roll/' + frame.get('roll').id + '/frame/' + frame.id;
  },

  _videoPagePermalink: function(frame){
    if( frame.has('video') ){
      var v = frame.get('video');
      return 'http://shelby.tv/video/'+v.get('provider_name')+'/'+v.get('provider_id');
    } else if( frame.has('roll') ){
      var r = frame.get('roll');
      return 'http://shelby.tv/roll/'+r.id+'/frame/'+frame.id;
    } else {
      return 'http://shelby.tv/rollFromFrame/'+frame.id;
    }
  },

};
