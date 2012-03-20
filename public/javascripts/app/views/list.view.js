ListView = Support.CompositeView.extend({
  
  tagName : 'ul',

  className : 'list',

  options : {
    collectionAttribute : 'listCollection',
    listItemView : 'ListItemView'
  },
  
  initialize : function(){
    this.model.get(this.options.collectionAttribute).each(this.addOne);
    this.model.bind('add:'+this.options.collectionAttribute, this.addOne, this);
  },

  addOne : function(item){
    this.appendChild(this._constructListItemView(item));
  },

  _cleanup : function(){
    this.model.unbind('add:'+this.options.collectionAttribute, this.addOne, this);
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
