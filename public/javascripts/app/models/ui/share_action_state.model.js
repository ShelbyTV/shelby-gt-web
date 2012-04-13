( function(){

  libs.shelbyGT.ShareActionState = {
    share : 'share',
    complete : 'complete',
    failed : 'failed',
    none : 'none'
  };

  var ShareActionState = libs.shelbyGT.ShareActionState;

  libs.shelbyGT.ShareActionStateModel = Backbone.Model.extend({
    defaults: {
      doShare: ShareActionState.none
    }
  });

} ) ();