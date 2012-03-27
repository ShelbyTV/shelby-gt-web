( function(){

  // shorten names of included library prototypes
  var ListView = libs.shelbyGT.ListView;

  libs.shelbyGT.AutoScrollFrameListView = ListView.extend({

    initialize : function() {
      shelby.models.guide.bind('change:activeFrameModel', this._onNewActiveFrame, this);
      ListView.prototype.initialize.call(this);
    },

    _onNewActiveFrame : function(guideModel, frame){
      var prevModelAttrs = guideModel.changedAttributes().activeFrameModel.attributes;
      var oldActiveFrameView = this.children.find(function(view){
        return view.model.attributes == prevModelAttrs;
      });
      var newActiveFrameView = this.children.find(function(view) {
        return view.model == frame;
      });
      if (oldActiveFrameView){
        oldActiveFrameView.$el.removeClass('active-frame');
      }
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
