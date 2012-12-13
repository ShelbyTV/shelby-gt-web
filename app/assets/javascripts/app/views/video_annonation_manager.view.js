libs.shelbyGT.VideoAnnotationManagerView = Support.CompositeView.extend({

  // _annotationViews : private hash mapping event model cids to their corresponding annotation view
  _annotationViews : {},

  initialize: function(){
    this.model.bind("enter", this._onEventEntered, this);
    this.model.bind("exit", this._onEventExited, this);
  },

  _cleanup : function() {
    this.model.unbind("enter", this._onEventEntered, this);
    this.model.unbind("exit", this._onEventExited, this);
  },

  _onEventEntered : function(event) {
    var newAnnotationView = new libs.shelbyGT.VideoAnnotationView({model: event});
    this.appendChild(newAnnotationView);
    // map this event's cid to the view we created so we know which view to remove when
    // the event is exited
    this._annotationViews[event.cid] = newAnnotationView;
  },

  _onEventExited : function(event) {
    var viewToLeave = this._annotationViews[event.cid];
    if (viewToLeave) {
      viewToLeave.leave();
    }
  }


});