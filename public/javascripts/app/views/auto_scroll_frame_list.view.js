( function(){

  // shorten names of included library prototypes
  var ListView = libs.shelbyGT.ListView;

  libs.shelbyGT.AutoScrollFrameListView = ListView.extend({

    initialize : function() {
      shelby.models.guide.bind('change:activeFrameModel', this._onNewActiveFrame, this);
      ListView.prototype.initialize.call(this);
    },

    _findByViewModel : function(model){
      return function(view){
        return view.model == model;
      }
    },

    _getActiveFrameViews : function(guideModel, currentActiveFrameModel){
      return {
        current : this.children.find(this._findByViewModel(currentActiveFrameModel)),
        old : this.children.find(this._findByViewModel(guideModel.previousAttributes().activeFrameModel))
      };
    },

    _onNewActiveFrame : function(guideModel, currentActiveFrameModel){
      var frameViews = this._getActiveFrameViews(guideModel, currentActiveFrameModel);
      if (frameViews.current) {
        this._switchActiveFrameViews(frameViews);
      }
    },

    _switchActiveFrameViews : function(frameViews){
      frameViews.old && frameViews.old.$el.removeClass('active-frame');
      frameViews.current && frameViews.current.$el.addClass('active-frame');
      this.parent.$el.scrollTo(frameViews.current.$el, {duration:200, axis:'y', offset:-9});
    },

    _cleanup : function(){
      shelby.models.guide.unbind('change:activeFrameModel', this._onNewActiveFrame, this);
    }

  });

} ) ();
