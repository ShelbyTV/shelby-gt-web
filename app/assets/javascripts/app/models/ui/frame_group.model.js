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

  getFirstFrame : function() {
    return this.get('frames').at(0);
  },

  getRelations : function () {
     return null;
  }

});
