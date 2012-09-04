libs.shelbyGT.FrameGroupModel = Backbone.Model.extend({

  defaults: {
    "frames" : null,
    "primaryDashboardEntry" : null
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
    this.get('frames').each(function(frame){
      frame.destroy();
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
  }

});
