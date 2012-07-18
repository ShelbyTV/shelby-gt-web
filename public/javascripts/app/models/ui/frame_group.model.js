libs.shelbyGT.FrameGroupModel = Backbone.Model.extend({

  frames : null,
  primaryDashboardEntry : null,

  add: function (frame, dashboard_entry) {

     if (!frame.get('id')) {
        return;
     }

     if (!this.frames) {
        this.frames = new Array;
     }

     // first addition
     if (this.frames.length == 0) {
        this.frames.push(frame);
        this.primaryDashboardEntry = dashboard_entry;
     } else {
        // make sure we don't already have this...
        for (var i = 0; i < this.frames.length; i++) {
           if (this.frames[i].get('id') == frame.get('id')) {
              return;
           }
        }
        // guess we don't have this frame yet
        this.frames.push(frame);
     } 
  },

  getRelations : function () {
     return null;
  }

});
