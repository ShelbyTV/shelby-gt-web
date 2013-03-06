libs.shelbyGT.FrameGroupModel = Backbone.Model.extend({

  // Do we treat this video as playable or not? See _handleVideoPlayability
  CONSIDER_PERMANENTLY_UNPLAYABLE_H : 48,
  RECONSIDER_PLAYABILITY_AFTER_H : 1,

  defaults: {
    "frames" : null,
    "primaryDashboardEntry" : null,
    "collapsed" : false,
    "video_unplayable" : false
  },

  add: function (frame, dashboard_entry, options) {

     options || (options = {});

     if (!frame.get('id')) {
        return;
     }

     if (!this.get('frames')) {
        this.set( { frames : new libs.shelbyGT.FramesCollection() }, options);
     }

     // first addition
     if (this.get('frames').length == 0) {
        this.get('frames').add(frame, options);
        this.set( { primaryDashboardEntry : dashboard_entry } , options);

        //dynamically collapse and mark videos as unplayable
        frame.get('video').bind('change:last_unplayable_at', this._handleVideoPlayability, this);
        this._handleVideoPlayability(frame.get('video'));
     } else {
        // make sure we don't already have this...
        for (var i = 0; i < this.get('frames').length; i++) {
           if (this.get('frames').at(i).get('id') == frame.get('id')) {
              return;
           }
        }
        // guess we don't have this frame yet
        this.get('frames').add(frame, options);
     }
  },

  destroy : function(options) {
    Backbone.Model.prototype.destroy.call(this, options);
    //remove all bindings to this frame group - if some view has a problem with that,
    //that's bad modular development and needs to be fixed
    this.unbind();
    this.getFirstFrame() && this.getFirstFrame().unbind('change:last_unplayable_at', this._handleVideoPlayability, this);
    this.get('frames').each(function(frame){
      frame.destroy();
      //remove all bindings to this frame
      frame.unbind();
    });
  },

  getFirstFrame : function() {
    return this.get('frames').at(0);
  },

  getDuplicateFramesToDisplay : function () {
    var firstFrame = this.getFirstFrame();
    var firstFramesRoll = firstFrame && firstFrame.get('roll');
    //we only show the duplicate frame information once for each roll that dupes come from,
    //and not at all for dupes from the same roll as the group's first frame
    return this.get('frames').chain().rest().select(function (frame){
      return frame.has('roll') && (!firstFramesRoll || firstFramesRoll.id != frame.get('roll').id);
    }).uniq(false, function(frame){return frame.get('roll').id;}).compact().value();
  },

  /* If a video has no record of playback failure, treat as playable.
   * If a video has been unplayable for CONSIDER_PERMANENTLY_UNPLAYABLE hours, treat as unplayable.
   * If a video was detected unplayable more than RECONSIDER_PLAYABILITY_AFTER_H hours ago, treat as playable.
   */
  _handleVideoPlayability : function(video, lastUnplayableAtRaw){
    // this algo works for all videos, including those w/o <first|last>_unplayable_at
    var firstUnplayable = new Date(video.get('first_unplayable_at'));                       // new Date(null) returns epoch
    var lastUnplayable = new Date(lastUnplayableAtRaw || video.get('last_unplayable_at'));  // new Date(null) returns epoch
    var unplayableForHours = (lastUnplayable - firstUnplayable) / (1000*60*60);       // 0 for good videos
    var discoveredUnplayableHoursAgo = (new Date() - lastUnplayable) / (1000*60*60);  // very big for good videos

    if( unplayableForHours > this.CONSIDER_PERMANENTLY_UNPLAYABLE_H ||
        discoveredUnplayableHoursAgo < this.RECONSIDER_PLAYABILITY_AFTER_H){
      this.set({video_unplayable:true, collapsed:true});
    }
  },

  getCombinedLikeInfo : function() {
    var result = {
      likers : new libs.shelbyGT.UserCollection(),
      totalLikes : 0
    };
    var frames = this.get('frames');

    if (frames) {
      frames.reduce(function(memo, frame) {

        // don't know why, but for some reason the upvoters have sometimes not been converted to a collection
        // of user models at this point - if not, then do it now
        memo.likers.add(frame.convertUpvoterIdsToUserCollection().models);
        memo.totalLikes += frame.get('like_count') || 0;
        return memo;
      }, result);
    }

    // upvotes from the previous implementation may cause the likes number to be too low
    if (result.totalLikes < result.likers.length) {
      result.totalLikes = result.likers.length;
    }

    return result;
  }

});
