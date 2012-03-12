ListView = Support.CompositeView.extend({
  
  options : {
    collectionAttribute : 'listCollection',
    listItemView : ListItemView
  },
  
  initialize : function(){
    this.model.bind('add:'+this.options.collectionAttribute, this.addOne, this);
  },

  addOne : function(item){
    console.log('myles');
    this.appendChild(new this.options.listItemView({model: item}));
  }

});
