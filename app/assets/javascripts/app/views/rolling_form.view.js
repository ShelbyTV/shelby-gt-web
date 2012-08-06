/*
*	This form is Step 2 in the rolling process.
* It handles two cases when rolling: create new roll, roll to existing roll.
*
* FrameRollingView, our parent, set itself up for step one (choosing new or existing roll).
* We will perform the actual rolling and sharing, updating our parent view via ShareActionStateModel.
*
*/
( function(){
	
	var BackboneCollectionUtils = libs.utils.BackboneCollectionUtils;
	var RollFollowingsConfig = shelby.config.db.rollFollowings;
	var RollModel = libs.shelbyGT.RollModel;
	var ShareActionState = libs.shelbyGT.ShareActionState;
	var ShareActionStateModel = libs.shelbyGT.ShareActionStateModel;
	var ShelbyAutocompleteView = libs.shelbyGT.ShelbyAutocompleteView;
	
	libs.shelbyGT.RollingFormView = Support.CompositeView.extend({
		
		events : {
			"click #roll-it"					: '_doRoll',
			"focus #new-roll-name" 		: '_clearErrors',
			"focus #rolling-message"	: '_clearErrors'
    },
  
    className : 'rolling-form',

    template : function(obj){
      return JST['rolling-form'](obj);
    },
  
    initialize : function(){
      this._frameRollingState = new ShareActionStateModel();
			this._roll = this.options.roll;
			this._frame = this.options.frame;
    },

		render : function(){
			var self = this;
			
      this.$el.html(this.template({roll:this._roll, frame:this._frame}));

      this._shelbyAutocompleteView = new ShelbyAutocompleteView({
        el : this.$('#rolling-message')[0],
        includeSources : ['shelby', 'twitter', 'facebook'],
        multiTerm : true,
        multiTermMethod : 'paragraph',
        shelbySource : function() {
          return _(self._frame.get('conversation').get('messages').pluck('nickname')).uniq();
        }
      });
      this.renderChild(this._shelbyAutocompleteView);
    },

		_doRoll : function(e){
			e.preventDefault();
			
			if(!this._validate()){ return; }
			
			if(this._roll){
				this._rerollFrameAndShare(this._roll);
			}	else {
				this._createRollRerollFrameAndShare();
			}
		},
		
		_validate : function(){
      validates = true;

      if( !this._roll && this.$("#new-roll-name").val().length < 1 ){
				shelby.alert("Please enter a name for your Roll");
        this.$('#new-roll-name').addClass('error');
        validates = false;
      }

			if( this.$("#rolling-message").val().length < 1 ){
				shelby.alert("Please enter a comment");
        this.$('#rolling-message').addClass('error');
        validates = false;
      }

      return validates;
		},
		
		_clearErrors : function(){
			this.$('#new-roll-name').removeClass('error');
			this.$('#rolling-message').removeClass('error');
		},
		
		// create new roll, then proceed like normal
		_createRollRerollFrameAndShare : function(){	
			var self = this;
			
			var roll = new RollModel({ 
				'title' : this.$("#new-roll-name").val(),
				'public': true, 
				'collaborative': false});
			
			roll.save(null, {
        success : function(newRoll){
					// add new roll to rolls collection, correctly sorted
          BackboneCollectionUtils.insertAtSortedIndex(
						newRoll,
            shelby.models.rollFollowings.get('rolls'), 
            {searchOffset:  RollFollowingsConfig.numSpecialRolls, 
             sortAttribute: RollFollowingsConfig.sortAttribute,
             sortDirection: RollFollowingsConfig.sortDirection});

					//proceed with re-rolling and sharing
					self._rerollFrameAndShare(newRoll);
        }});
		},
		
		_rerollFrameAndShare : function(roll){
			var self = this;
			var message = this.$("#rolling-message").val();
			var shareDests = [];
			if(this.$("#share-on-twitter").is(':checked')){ shareDests.push('twitter'); }
			if(this.$("#share-on-facebook").is(':checked')){ shareDests.push('facebook'); }
			
			// re roll the frame
      this._frame.reRoll(roll, function(newFrame){
        //rolling is done
				self._rollingSuccess(roll, newFrame);
				// Optional Sharing (happens in the background)
        self._frameRollingState.get('shareModel').set({destination: shareDests, text: message});
        self._frameRollingState.get('shareModel').save(null, {
          url : newFrame.shareUrl(),
          success : function(){
            /* noop */
          } 
        });
      });
		
		},
		
		_rollingSuccess : function(roll, newFrame){
			this.parent.done();
			
			//N.B. This link is picked up by NotificationOverlayView for routing
			shelby.success(
				"Rolled to <a href='#' data-roll_id='"+roll.id+"' class='roll-route'>"+
				libs.shelbyGT.viewHelpers.roll.titleWithPath(roll)+
				"</a>!");
		}
		
	});
	
}) ();
