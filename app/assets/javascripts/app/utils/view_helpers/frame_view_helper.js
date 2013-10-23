/*
 * JSTs aren't the place to do all sorts of fancy logic for displaying Frames.
 *
 * This should help to DRY them up.
 */
libs.shelbyGT.viewHelpers.frame = {

  /*
   * Mimicks the same permalink you would get from the backend, except
   * this will not be shortened.
   *
   */
  permalink: function(frame){
    if( frame.has('creator') ){
      return this._subdomainPermalink(frame);
    } else {
      return this._videoPagePermalink(frame);
    }
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
  }

};
