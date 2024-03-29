/*
 * Implements the rolling of a Frame onto a new Roll and optionally posting the rolled video to TWT/FB.
 *
 * Supports multiple rolls when enabled for the user.  Does not currently support roll creation.
 *
 */
( function(){

  // shorten names of included library prototypes
  var GuideOverlayView         = libs.shelbyGT.GuideOverlayView;
  var RollingCreateRollView    = libs.shelbyGT.RollingCreateRollView;
  var RollingSelectionListView = libs.shelbyGT.RollingSelectionListView;

  libs.shelbyGT.FrameRollingView = GuideOverlayView.extend({

    _currentFrameShortlink : null,

    events : _.extend({}, GuideOverlayView.prototype.events, {
      "click .js-cancel"                  : "_onClickCancel",
      "focus .js-input-select-on-focus"   : "_onFocusInputText",
      "mouseup .js-input-select-on-focus" : "_onMouseupInputText"
    }),

    className : GuideOverlayView.prototype.className + ' guide-overlay__rolling-frame js-rolling-frame',

    template : function(obj){
      return SHELBYJST['frame-rolling'](obj);
    },

    initialize : function(){
      this._getFrameShortlink();
    },

    render : function(){
      this._leaveChildren();

      this.$el.html(this.template({
        currentFrameShortlink : this._currentFrameShortlink,
        frame                 : this.model,
        frameVideo            : this.model.get('video'),
        user                  : shelby.models.user,
        userLoggedIn          : !shelby.models.user.isNotLoggedIn()
      }));

      // rolling details (personal roll as default)
      this._renderRollingFormChild(shelby.models.user.get('personal_roll'));
      GuideOverlayView.prototype.render.call(this);
    },

    //------------------------- SELECT ROLL ----------------------------

    // _renderRollSelectionChild: function(){
    //   //existing Rolls
    //   this._rollsListView = new RollingSelectionListView(
    //     {
    //       model : shelby.models.rollFollowings,
    //       frame : this.model,
    //       doStaticRender : true
    //     }
    //   );

    //   this.renderChildInto(this._rollsListView, this.$('.js-roll-selection'));
    // },

    // _showRollSelectionChild: function(e){
    //   e.preventDefault();
    //   this.$el.addClass("show-roll-selection");
    // },

    // _hideRollSelectionChild: function(){
    //   this.$el.removeClass("show-roll-selection");
    // },

    //------------------------- ROLLING DETAILS ----------------------------

    _renderRollingFormChild: function(roll){
      this._rollingForm = new libs.shelbyGT.RollingFormView({
        currentFrameShortlink : this._currentFrameShortlink,
        dashboardEntry : this.options.guideOverlayModel.get('activeGuideOverlayDashboardEntry'),
        frame: this.model,
        roll: roll
      });
      this.appendChildInto(this._rollingForm, '.js-guide-overlay-main');
    },

    _removeRollingFormChild: function(){
      if(this._rollingForm){ this._rollingForm.leave(); }
    },


    //------------------------- EVENTS ----------------------------

    done : function(){
      this._setGuideOverlayStateNone();
    },

    _onClickCancel : function(e){
      e.preventDefault();
      this.done();
    },

    _onFocusInputText : function(e){
      e.currentTarget.select();
    },

    _onMouseupInputText : function(e){
      e.preventDefault();
    },

    _getFrameShortlink : function() {

      var frame = this.model;

      if (frame.canBeShortlinked()) {
        var self = this;
        var $shortlinkTextInput = this.$('.js-frame-shortlink');
        var fetchShortlinkUrl;
        var dbEntry = this.options.guideOverlayModel.get('activeGuideOverlayDashboardEntry');
        if (dbEntry && !dbEntry.isRecommendationEntry()) {
          fetchShortlinkUrl = shelby.config.apiRoot + '/dashboard/' + dbEntry.id + '/short_link';
        } else {
          fetchShortlinkUrl = shelby.config.apiRoot + '/frame/' + frame.id + '/short_link';
        }
        // fetch the short link
        $.ajax({
          url: fetchShortlinkUrl,
          dataType: 'jsonp',
          success: function(r){
            $shortlinkTextInput.val(r.result.short_link);
            // save the link for future reference in case we are going to
            // re-render without changing frames
            self._currentFrameShortlink = r.result.short_link;
            self.render();
          },
          error: function(){
            $shortlinkTextInput.val("Link Unavailable");
          }
        });
      }
    }


  });

} ) ();
