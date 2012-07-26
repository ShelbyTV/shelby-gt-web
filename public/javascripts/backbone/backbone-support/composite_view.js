Support.CompositeView = function(options) {
  this.children = _([]);
  Backbone.View.apply(this, [options]);
};

_.extend(Support.CompositeView.prototype, Backbone.View.prototype, {
  leave: function() {
    this.unbind();
    this._cleanup();
    this.remove();
    this._leaveChildren();
    this._removeFromParent();
    this.undelegateEvents();
  },

  renderChild: function(view, childIndex) {
    view.render();
    if (typeof(childIndex) !== 'undefined'){
      this.children.splice(childIndex, 0, view);
    } else {
      this.children.push(view);
    }
    view.parent = this;
  },

  appendChild: function(view) {
    this.renderChild(view);
    $(this.el).append(view.el);
  },

  //TODO: refactor these to be DRYer

  insertChildBefore: function(view, selector) {
    this.renderChild(view);
    this.$(selector).before(view.el);
  },

  insertChildAt : function(view, childIndex) {
    var insertBeforeThis = this.children.value()[childIndex].el;
    this.renderChild(view, childIndex);
    this.$(insertBeforeThis).before(view.el);
  },

  prependChild : function(view, showFn){
    this.renderChild(view);
    if (showFn){
      view.$el.hide();
    }
    this.$el.prepend(view.el);
    view.$el[showFn]();
  },

  appendChildInto: function(view, selector) {
    this.renderChild(view);
    this.$(selector).append(view.el);
  },

  renderChildInto: function(view, container) {
    this.renderChild(view);
    $(container).empty().append(view.el);
  },

  _cleanup: function(){
    //sub-classes override for custom cleanup
  },

  _leaveChildren: function() {
    var childrenCopy = _(this.children.clone());
    childrenCopy.each(function(view) {
      if (view.leave)
        view.leave();
    });
  },

  _removeFromParent: function() {
    if (this.parent)
      this.parent._removeChild(this);
  },

  _removeChild: function(view) {
    var index = this.children.indexOf(view);
    this.children.splice(index, 1);
  },

  delegateEvents : function(recursive) {
    Backbone.View.prototype.delegateEvents.call(this);
    if (recursive) {
      this.children.each(function(childView){
        childView.delegateEvents(recursive);
      });
    }
  }

});

Support.CompositeView.extend = Backbone.View.extend;
