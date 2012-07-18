libs.shelbyGT.FrameGroupModel = Backbone.Model.extend({

  defaults: {
    "frames" : null,
    "primaryDashboardEntry" : null
  },

  add: function (frame, dashboard_entry) {

     if (!frame.get('id')) {
        return;
     }

     if (!this.get('frames')) {
        this.set( { frames : new libs.shelbyGT.FramesCollection } );
     }

     // first addition
     if (this.get('frames').length == 0) {
        this.get('frames').add(frame);
        this.set( { primaryDashboardEntry : dashboard_entry } );
     } else {
        // make sure we don't already have this...
        for (var i = 0; i < this.get('frames').length; i++) {
           if (this.get('frames').at(i).get('id') == frame.get('id')) {
              return;
           }
        }
        // guess we don't have this frame yet
        this.get('frames').add(frame);
     } 
  },

  getRelations : function () {
     return null;
  }

});
