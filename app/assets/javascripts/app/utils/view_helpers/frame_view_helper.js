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
  },

};
