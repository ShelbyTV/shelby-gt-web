libs.shelbyGT.RollListView = libs.shelbyGT.ListView.extend({

  className : /*libs.shelbyGT.ListView.prototype.className +*/ 'rolls-list js-rolls-list',

  options : _.extend({}, libs.shelbyGT.ListView.prototype.options, {
    collectionAttribute : 'roll_followings',
    listItemView : 'RollItemView'
  }),

  initialize : function(){
    shelby.models.guidePresentation.bind('change:content', this._onContentChanged, this);
    libs.shelbyGT.ListView.prototype.initialize.call(this);
  },

  _cleanup : function(){
    shelby.models.guidePresentation.unbind('change:content', this._onContentChanged, this);
    libs.shelbyGT.ListView.prototype._cleanup.call(this);
  },

  _onContentChanged : function(guidePresentationModel, content){
    switch(content){
      default:
        console.log("what was that?", content);
    }
  }

});