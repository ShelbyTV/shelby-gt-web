( function(){

  // shorten names of included library prototypes
  var ListView = libs.shelbyGT.ListView;

  libs.shelbyGT.AutoScrollFrameListView = ListView.extend({

    initialize : function() {
      shelby.models.guide.bind('change:activeFrameModel', this._onNewActiveFrame, this);
      ListView.prototype.initialize.call(this);
    },

    _onNewActiveFrame : function(guideModel, frame){
      // why is prevModel always null?
      var oldModel = guideModel.previousAttributes().activeFrameModel;
      /*var oldActiveFrameView = this.children.find(function(view){
        return view.model == oldModel;
      });
      if (oldActiveFrameView){
        oldActiveFrameView.$el.removeClass('active-frame');
      }*/
      var newActiveFrameView = this.children.find(function(view) {
        return view.model == frame;
      });
      if (newActiveFrameView) {
        newActiveFrameView.$el.addClass('active-frame');
        this.parent.$el.scrollTo(newActiveFrameView.$el, {duration:200, axis:'y', offset:-9});
      }
    },

    _cleanup : function(){
      shelby.models.guide.unbind('change:activeFrameModel', this._onNewActiveFrame, this);
    }

  });

} ) ();
