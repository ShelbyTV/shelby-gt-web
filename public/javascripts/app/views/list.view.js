libs.shelbyGT.ListView = Support.CompositeView.extend({
  
  tagName : 'ul',

  className : 'list',

  options : {
    collectionAttribute : 'listCollection',
    listItemView : 'ListItemView',
    insert : {
      position : 'append',
      selector : null
    }
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
    var childView = this._constructListItemView(item);
    if (this.options.insert && this.options.insert.position) {
      switch (this.options.insert.position) {
        case 'append' :
          this.appendChild(childView);
          return;
        case 'before' :
          if (this.options.insert.selector) {
            this.insertChildBefore(childView, this.options.insert.selector);
            return;
          }
      }
    }

    // default behavior if not enough options were supplied
    this.appendChild(childView);
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
