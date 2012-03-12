ListView = Backbone.View.extend({
  
  options : {
    collectionAttribute : 'listCollection',
    listItemView : FrameView
  },
  
  initialize : function(){
    console.log(this.model.get(this.options.collectionAttribute));
    this.model.get(this.options.collectionAttribute).bind('add', this.addOne, this);
    this.model.get(this.options.collectionAttribute).bind('reset', this.addAll, this);
    //this.model.get('frames').bind('all', this.render, this);
  },

  // render : function(){
  // },

  addOne : function(item){
    console.log(this.el);
    var listItemView = new this.options.listItemView({model: item});
    listItemView.render();
    this.$el.append(listItemView.el);
  },

  addAll: function(items) {
    this.$el.html('');
    items.each(this.addOne);
  }

});
