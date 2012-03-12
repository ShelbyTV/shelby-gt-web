ListView = Support.CompositeView.extend({
  
  options : {
    collectionAttribute : 'listCollection',
    listItemView : ListItemView
  },
  
  initialize : function(){
    this.model.bind(this.options.collectionAttribute+':add', this.addOne, this);
  },

  // render : function(){
  // },
  //

  addOne : function(item){
    console.log('myles');
    this.appendChild(new this.options.listItemView({model: item}));
  }

});
