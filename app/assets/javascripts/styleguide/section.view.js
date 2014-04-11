$(function(){
  shelby.SectionView = Backbone.View.extend({
    options: {
      annotationsList : '.js-annotations-list',
      attribute       : 'data-note',
      visuallyhidden  : 'visuallyhidden'
    },
    events: {
      'mouseenter .css-tag' : '_showAnnotation',
      'mouseleave .css-tag' : '_hideAnnotation'
    },
    initialize: function(e){
      //cache OL
      this._list = this.$el.find(this.options.annotationsList);
      //hide all the LI's
      this._list.children().addClass(this.options.visuallyhidden);
    },
    _showAnnotation: function(e){
      var signature = this._getCharIndex(e.target);
      this._setVisibility(signature,true);
    },
    _hideAnnotation: function(e){
      var signature = this._getCharIndex(e.target);
      this._setVisibility(signature,false);
    },
    _getCharIndex: function(element){
      //returns a number for _setVisibility arg 'signature'
      return $.indexChar(element.getAttribute(this.options.attribute));
    },
    _setVisibility: function(signature,visibility) {
      // !visibility, is because it's more intuitive to pass true: _setVisibility(1,true) for showing.
      this._list.children().eq(signature).toggleClass(this.options.visuallyhidden,!visibility);
    }
  });
});
