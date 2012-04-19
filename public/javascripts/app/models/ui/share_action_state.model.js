( function(){

  libs.shelbyGT.ShareActionState = {
    share : 'share',
    complete : 'complete',
    failed : 'failed',
    none : 'none'
  };

  var ShareActionState = libs.shelbyGT.ShareActionState;
  var ShareModel = libs.shelbyGT.ShareModel;

  libs.shelbyGT.ShareActionStateModel = Backbone.Model.extend({

    defaults: {
      doShare: ShareActionState.none,
      shareModel: null
    },

    initialize: function() {
      this.set('shareModel', new ShareModel());
    }

  });

} ) ();