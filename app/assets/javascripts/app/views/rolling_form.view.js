/*
*	This form is Step 2 in the rolling process.
* It handles two cases when rolling: create new roll, roll to existing roll.
*
* FrameRollingView, our parent, set itself up for step one (choosing new or existing roll).
* We will perform the actual rolling and sharing, updating our parent view via ShareActionStateModel.
*
*/
( function(){
	
  var BackboneCollectionUtils       = libs.utils.BackboneCollectionUtils;
  var MessageModel                  = libs.shelbyGT.MessageModel;
  var RollFollowingsConfig          = shelby.config.db.rollFollowings;
  var RollModel                     = libs.shelbyGT.RollModel;
  var RollViewHelpers               = libs.shelbyGT.viewHelpers.roll;
  var ShareActionState              = libs.shelbyGT.ShareActionState;
  var ShareActionStateModel         = libs.shelbyGT.ShareActionStateModel;
  var ShelbyAutocompleteView        = libs.shelbyGT.ShelbyAutocompleteView;
	
	libs.shelbyGT.RollingFormView = Support.CompositeView.extend({
		
		events : {
			"click #js-roll-it"					: '_doRoll',
			"focus #new-roll-name" 		  : '_clearErrors',
			"focus #js-rolling-message"	: '_clearErrors'
    },
  
    className : 'rolling-form',

    template : function(obj){
      return SHELBYJST['rolling-form'](obj);
    },
  
    initialize : function(){
      this._frameRollingState = new ShareActionStateModel();
      this._roll = this.options.roll;
      this._frame = this.options.frame;
    },

		render : function(){
			var self = this;
			

      this.$el.html(this.template({
                    roll:this._roll, 
                    frame:this._frame,
                    user: shelby.models.user,
                    rollOptions: {
                      pathForDisplay:RollViewHelpers.pathForDisplay(this._roll), 
                      titleWithoutPath:RollViewHelpers.titleWithoutPath(this._roll), 
                      urlForRoll:RollViewHelpers.urlForRoll(this._roll)
                    }
                  }
                ));

      this._shelbyAutocompleteView = new ShelbyAutocompleteView({
        el : this.$('#js-rolling-message')[0],
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
			e.preventDefault;

      if(!this._validate()){ return; }
			if(this._roll){
				this._rerollFrameAndShare(this._roll);
			}	else {
				this._createRollRerollFrameAndShare();
			}
		},
		
		_validate : function(){
      validates = true;

			if( this.$("#js-rolling-message").val().length < 1 ){
				shelby.alert("Please enter a comment");
        this.$('#js-rolling-message').addClass('error');
        validates = false;
      }

      return validates;
		},
		
		_clearErrors : function(){
			// this.$('#new-roll-name').removeClass('error');
			this.$('#js-rolling-message').removeClass('error');
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
			var message = this.$("#js-rolling-message").val();
			var shareDests = [];
      if(this.$("#share-on-twitter").is(':checked')){ shareDests.push('twitter'); }
      if(this.$("#share-on-facebook").is(':checked')){ shareDests.push('facebook'); }
      
      // if we are in a search result, add to roll via url
      if (shelby.models.guide.get('displayState') === "search") {
        this._addViaUrl(message, roll, shareDests);
      }
      else {
        // elsere roll the frame
        this._frame.reRoll(roll, message, function(newFrame){
          //rolling is done (don't need to wait for add message to complete)
          self._rollingSuccess(roll, newFrame);
          // Optional Sharing (happens in the background)
          if (shareDests.length) {
            self._frameRollingState.get('shareModel').save({destination: shareDests, text: message}, {
              url : newFrame.shareUrl(),
              success : function(){
                shelby.track('shared_frame',{destination: shareDests.join(", ")});
              }
            });
          }
        });        
      }
		},
		
		_rollingSuccess : function(roll, newFrame){
			this.parent.done();
			//N.B. This link is picked up by NotificationOverlayView for routing
			shelby.success('<span class="message-link"><a href="#" data-roll_id="'+roll.id+'" class="roll-route">Go to Roll</a></span> Video successfully rolled!');
		},
		
		_addViaUrl : function(message, roll, shareDests) {
		  var self = this;
		  var newFrame = new libs.shelbyGT.FrameModel();
  		newFrame.save(
  			{url: this._frame.get('video').get('source_url'), text: message, source: 'webapp'},
  			{url: shelby.config.apiRoot + '/roll/'+roll.id+'/frames', 
  			success: function(newFrame){
  			  //rolling is done (don't need to wait for add message to complete)
          self._rollingSuccess(roll, newFrame);
          // Optional Sharing (happens in the background)
          if (shareDests.length) {
            self._frameRollingState.get('shareModel').save({destination: shareDests, text: message}, {
              url : newFrame.shareUrl(),
              success : function(){
                shelby.track('shared_frame',{destination: shareDests.join(", ")});
              }
            });
          }
  			},
  			error: function(a,b,c){
  				if (b.status == 404) { shelby.alert("404 error"); } 
  				else { shelby.alert("sorry, something went wrong."); }
  			}
  		});
		}
		
	});
	
}) ();
