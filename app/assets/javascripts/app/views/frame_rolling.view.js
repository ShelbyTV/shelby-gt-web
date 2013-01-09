/*
 * Implements the rolling of a Frame onto a new Roll and optionally posting the rolled video to TWT/FB.
 *
 * Supports multiple rolls when enabled for the user.  Does not currently support roll creation.
 *
 */
( function(){

  // shorten names of included library prototypes
  var GuideOverlayView = libs.shelbyGT.GuideOverlayView;
  var RollingCreateRollView = libs.shelbyGT.RollingCreateRollView;
  var RollingSelectionListView = libs.shelbyGT.RollingSelectionListView;

  libs.shelbyGT.FrameRollingView = GuideOverlayView.extend({

    // allow power users to choose from their various rolls
    _multiRollEnabled : false,

    events : _.extend({}, GuideOverlayView.prototype.events, {
      "click .js-cancel"							        : "_setGuideOverlayStateNone",  //cancel from Step 1/2
			"click .js-create-roll"						      : "_createRoll", // NOT CURRENTLY IMPLEMENTED
			"click .js-change-rolling-destination"  : "_showRollSelectionChild"
    }),

    className : GuideOverlayView.prototype.className + ' guide-overlay__rolling-frame js-rolling-frame',

    template : function(obj){
      return SHELBYJST['frame-rolling'](obj);
    },

    initialize : function(){
      this._multiRollEnabled = shelby.models.user.hasAbility("multi_roll_roller");
    },

    _cleanup : function(){
    },

    render : function(){
      this.$el.html(this.template({frame:this.model, user: shelby.models.user}));

			// select roll for power users
      if(this._multiRollEnabled){
        this._renderRollSelectionChild();
        this.$el.addClass('multi-roll-enabled');
      }

      // rolling details (personal roll as default)
      this._renderRollingFormChild(shelby.models.user.get('personal_roll'));

      GuideOverlayView.prototype.render.call(this);
    },

		//------------------------- SELECT ROLL ----------------------------

		_renderRollSelectionChild: function(){
			//existing Rolls
      this._rollsListView = new RollingSelectionListView(
        {
          model : shelby.models.rollFollowings,
          frame : this.model,
          doStaticRender : true
        }
      );

      this.renderChildInto(this._rollsListView, this.$('.js-roll-selection'));
		},

		_showRollSelectionChild: function(e){
		  e.preventDefault();
		  this.$el.addClass("show-roll-selection");
		},

		_hideRollSelectionChild: function(){
		  this.$el.removeClass("show-roll-selection");
		},

		//------------------------- ROLLING DETAILS ----------------------------

		_renderRollingFormChild: function(roll){
      this._rollingForm = new libs.shelbyGT.RollingFormView({
        roll: roll,
        frame: this.model
      });
      this.appendChildInto(this._rollingForm, '.guide-overlay-main');
		},

		_removeRollingFormChild: function(){
			if(this._rollingForm){ this._rollingForm.leave(); }
		},


		//------------------------- EVENTS ----------------------------

		// via click event on Create button
		// NOT CURRENTLY IMPLEMENTED
		_createRoll: function(){
      this._rollingForm.setRoll();
      this.$el.find('.js-rolling-destination-display').html("New Roll");
		},

		// via child view RollingSelectionListView via RollingSelectionListViewItem
		// this may happen any number of times
		selectRoll: function(roll){
			this._rollingForm.setRoll(roll);
			this.$el.find('.js-rolling-destination-display').html(libs.shelbyGT.viewHelpers.roll.titleWithoutPath(roll));
			this._hideRollSelectionChild();
		},

		done : function(){
			this._setGuideOverlayStateNone();
		}

  });

} ) ();
