( function(){

  // shorten names of included library prototypes
  var GuideOverlayView = libs.shelbyGT.GuideOverlayView;
  var RollingCreateRollView = libs.shelbyGT.RollingCreateRollView;
  var RollingSelectionListView = libs.shelbyGT.RollingSelectionListView;
  var ShareActionState = libs.shelbyGT.ShareActionState;
  
  libs.shelbyGT.FrameRollingView = GuideOverlayView.extend({

    _frameRollingState : null,

		_autoChoosePersonalRoll : true,

    events : _.extend({}, GuideOverlayView.prototype.events, {
      "click .js-cancel"							: "_setGuideOverlayStateNone",  //cancel from Step 1/2
			"click .back"										: "_backToRollSelection", //back from Step 2/2
			"click .create-roll"						: "_createRoll"
    }),

    className : GuideOverlayView.prototype.className + ' js-rolling-frame rolling-frame',

    template : function(obj){
      return JST['frame-rolling'](obj);
    },

    initialize : function(){
    },

    _cleanup : function(){
    },

    render : function(){
      this.$el.html(this.template({frame:this.model, user: shelby.models.user}));

			if(this._autoChoosePersonalRoll && shelby.models.user.get('personal_roll')){
				//skipping step 1.  Rendering Step 2 with user's personal roll.
				this.selectRoll(shelby.models.user.get('personal_roll'));
				//user can't go back to step 1 since it doesn't exist
				// this.$(".guide-overlay-title .cancel").show();
				// this.$(".guide-overlay-title .back").hide();
			} 
			else {
				// render step 1: roll selection
	      this._renderRollSelectionChild();
			}

      GuideOverlayView.prototype.render.call(this);
    },

		//------------------------- STEP 1 ----------------------------
		
		_renderRollSelectionChild: function(){
			// this.$(".guide-overlay-title .cancel").show();
			// this.$(".guide-overlay-title .back").hide();
			
			this.$('.select-roll-type').show();
			
			//create new roll button is part of our view
			//existing Rolls
      this._rollsListView = new RollingSelectionListView(
        {
          model : shelby.models.rollFollowings,
          frame : this.model,
          doStaticRender : true
        }
      );

      this.appendChildInto(this._rollsListView, '.js-existing-rolls-list');
		},
		
		_removeRollSelectionChild: function(){
			if(this._rollsListView){ this._rollsListView.leave(); }
			//need to hide b/c create new roll is not part of the rolls list subview
			this.$('.select-roll-type').hide();
		},
		

		//------------------------- STEP 2 ----------------------------
		
		_renderRollingFormChild: function(roll){
			// this.$(".guide-overlay-title .cancel").hide();
			// this.$(".guide-overlay-title .back").show();
			
			this._rollingForm = new libs.shelbyGT.RollingFormView({
				roll: roll,
				frame: this.model,
				frameRollingState: this._frameRollingState
			});
			this.appendChildInto(this._rollingForm, '.guide-overlay-main');
		},
		
		_removeRollingFormChild: function(){
			if(this._rollingForm){ this._rollingForm.leave(); }
		},
		
		
		//------------------------- EVENTS ----------------------------
		
		// via click event on Create button
		_createRoll: function(){
			this._removeRollSelectionChild();
			this._renderRollingFormChild();
		},
		
		// via child view RollingSelectionListView via RollingSelectionListViewItem
		selectRoll: function(roll){
			this._removeRollSelectionChild();
			this._renderRollingFormChild(roll);
		},
		
		_backToRollSelection: function(){
			this._removeRollingFormChild();
			this._renderRollSelectionChild();
		},
		
		done : function(){
			this._backToRollSelection();
			this._setGuideOverlayStateNone();
		}

  });

} ) ();
