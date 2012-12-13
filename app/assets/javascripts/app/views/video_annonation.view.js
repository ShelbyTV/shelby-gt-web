libs.shelbyGT.VideoAnnotationView = Support.CompositeView.extend({

  tagName: 'div',

  className: 'annotation',

  template : function(obj){
    return SHELBYJST['video-annotation'](obj);
  },

  render : function(){
    this.$el.html(this.template({
      event: this.model
    }));
    var themeClassName;
    switch (this.model.get('theme')) {
      case libs.shelbyGT.PopupEventThemes.stickyNote :
        themeClassName = 'annotation--sticky';
        break;
      case libs.shelbyGT.PopupEventThemes.meme :
        themeClassName = 'annotation--meme';
        break;
      case libs.shelbyGT.PopupEventThemes.basic :
        themeClassName = 'annotation--basic';
        break;
      default :
        themeClassName = 'annotation--basic';
        break;
    }
    this.$el.addClass(themeClassName);
  }

});