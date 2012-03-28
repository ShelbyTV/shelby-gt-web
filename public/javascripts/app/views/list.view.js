libs.shelbyGT.ListView = Support.CompositeView.extend({
  
  tagName : 'ul',

  className : 'list',

  options : {
    collectionAttribute : 'listCollection',
    listItemView : 'ListItemView'
  },
  
  initialize : function(){
    this.model.bind('add:'+this.options.collectionAttribute, this.addOne, this);
    this.model.bind('remove:'+this.options.collectionAttribute, this.removeOne, this);
  },

  _cleanup : function(){
    this.model.unbind('add:'+this.options.collectionAttribute, this.addOne, this);
    this.model.unbind('remove:'+this.options.collectionAttribute, this.removeOne, this);
  },

  addOne : function(item){
    this.appendChild(this._constructListItemView(item));
  },

  removeOne : function(item){
    var viewToRemove = this.children.find(this._findViewByModel(item));
    if (viewToRemove) {
      viewToRemove.leave();
    }
  },

  _findViewByModel : function(model){
    return function(view){
      return view.model == model;
    };
  },

  _constructListItemView : function(item){
    var proto;
    if (typeof this.options.listItemView === 'function'){
      return this.options.listItemView(item);
    } else {
      return new libs.shelbyGT[this.options.listItemView]({model:item});
    }
  }

});
