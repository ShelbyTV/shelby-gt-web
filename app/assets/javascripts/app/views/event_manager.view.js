/*
 * Implements the rolling of a Frame onto a new Roll and optionally posting the rolled video to TWT/FB.
 *
 * Supports multiple rolls when enabled for the user.  Does not currently support roll creation.
 *
 */
( function(){

  // shorten names of included library prototypes
  var GuideOverlayView = libs.shelbyGT.GuideOverlayView;
  var PlaybackEventListView = libs.shelbyGT.PlaybackEventListView;
  var PlaybackEventModel = libs.shelbyGT.PlaybackEventModel;

  libs.shelbyGT.EventManagerView = GuideOverlayView.extend({

    _playbackEventListView : null,

    events : _.extend({}, GuideOverlayView.prototype.events, {
      "click .js-cancel"            : "_setGuideOverlayStateNone",
      "click .js-cancel-annotation" : "_closeView",
      "click .js-add-new-popup"     : "_addNewPopup",
      "click .js-save-button"       : "_onClickSaveButton"
    }),

    className : GuideOverlayView.prototype.className + ' guide-overlay--event-manager js-event-manager-ui',

    template : function(obj){
      return SHELBYJST['event-manager'](obj);
    },

    initialize : function(){
    },

    _cleanup : function(){
    },

    render : function(){
      this.$el.html(this.template({frame:this.model, user:shelby.models.user}));
      this._playbackEventListView = new PlaybackEventListView({
        model: this.model
      });
      this.insertChildBefore(this._playbackEventListView, '.js-add-new-popup-fieldset');

      GuideOverlayView.prototype.render.call(this);
    },

    _addNewPopup : function(e){
      e.preventDefault();
      var newPopupEvent = new PlaybackEventModel({});
      this.model.get('events').add(newPopupEvent);
    },

    _onClickSaveButton : function(e) {
      e.preventDefault();
      _(this._playbackEventListView._listItemViews).each(function(view){
        view.saveFormDataToModel();
      });
      this._setGuideOverlayStateNone();
    },

    _closeView : function(e) {
      e.preventDefault();
      this._setGuideOverlayStateNone();
    }
  });

} ) ();