/*
 * Implements the rolling of a Frame onto a new Roll and optionally posting the rolled video to TWT/FB.
 *
 * Supports multiple rolls when enabled for the user.  Does not currently support roll creation.
 *
 */
( function(){

  // shorten names of included library prototypes
  var GuideOverlayView = libs.shelbyGT.GuideOverlayView;

  libs.shelbyGT.EventManagerView = GuideOverlayView.extend({
    events : _.extend({}, GuideOverlayView.prototype.events, {
      "click .js-cancel"                      : "_setGuideOverlayStateNone"  //cancel from Step 1/2
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

      GuideOverlayView.prototype.render.call(this);
    }
  });

} ) ();