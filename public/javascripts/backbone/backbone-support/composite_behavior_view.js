// A CompositeBehaviorView performs no initial rendering on its el, it only supplies the el
// with addtional behavior and handling.  As such, it does not remove its el from
// the DOM as part of its leave method.  Thus, leaving the view removes/unbinds the
// behavior supplied by the view, but the visual element in the DOM remains.
Support.CompositeBehaviorView = function(options) {
  Support.CompositeView.apply(this, [options]);
};

_.extend(Support.CompositeBehaviorView.prototype, Support.CompositeView.prototype, {
  leave: function() {
    this.unbind();
    this._cleanup();
    this._leaveChildren();
    this._removeFromParent();
    this.undelegateEvents();
  }
});

Support.CompositeBehaviorView.extend = Support.CompositeView.extend;