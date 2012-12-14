libs.shelbyGT.VideoAnnotationManagerView = Support.CompositeView.extend({

  // _annotationViews : private hash mapping event model cids to their corresponding annotation view
  _annotationViews : {},

  initialize: function(){
    this.model.bind("enter:" + libs.shelbyGT.PlaybackEventModelTypes.popup, this._onPopupEventEntered, this);
    this.model.bind("exit:" + libs.shelbyGT.PlaybackEventModelTypes.popup, this._onPopupEventExited, this);
  },

  _cleanup : function() {
    this.model.unbind("enter:" + libs.shelbyGT.PlaybackEventModelTypes.popup, this._onPopupEventEntered, this);
    this.model.unbind("exit:" + libs.shelbyGT.PlaybackEventModelTypes.popup, this._onPopupEventExited, this);
  },

  _onPopupEventEntered : function(event) {
    console.log(event.get('event_type') + 'entered');
    var newAnnotationView = new libs.shelbyGT.VideoAnnotationView({model: event});
    this.appendChild(newAnnotationView);
    // map this event's cid to the view we created so we know which view to remove when
    // the event is exited
    this._annotationViews[event.cid] = newAnnotationView;
  },

  _onPopupEventExited : function(event) {
    console.log(event.get('event_type') + 'exited');
    var viewToLeave = this._annotationViews[event.cid];
    if (viewToLeave) {
      viewToLeave.leave();
    }
  }


});