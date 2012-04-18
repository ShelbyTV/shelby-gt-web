if( typeof(shelby.userInactivity) === "undefined" ) shelby.userInactivity = {};

$.extend(shelby.userInactivity, {

	//-------------------------------------------------------
	// User Inactivity
	//-------------------------------------------------------
	//
	// After X seconds of user inactivity, adds the class .user-inactive to the body element.
	// Upon resumed user activity, removes the class .user-inactive from the body element.
	// When the mouse is left within any div with class .inactivity-preemption, do not set inactivity on body
	// When the mouse is active in any div with class .activity-ignore, do not count towards activity

	_lastUserActivity: Date.now(),
	_userActive: true,
	_userInactivityTime: 2 * 1000,
	_userInactivityBootLeniency: 2 * 1000,
	_userActivityDetectionEnabled: true,
	_userHoveringInactivityPreemption: false,
	_userHoveringActivityIgnore: false,
	_inactiveClass: "user-inactive",

	disableUserActivityDetection: function(){
		this._userActivityDetectionEnabled = false;
		$('body').removeClass("user-inactive");
		this._userActive = true;
	},

	enableUserActivityDetection: function(){
		this._lastUserActivity = Date.now();
		this._userActivityDetectionEnabled = true;
	},

	init: function(){
	  var self = this;
	
		//listen for activity
		$(document).bind('focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup', function(){ 
			//if we're not ignoring activity
			if( !self._userHoveringActivityIgnore)	{
				if( !self._userActive ){
					//update class and status if the user is currently inactive
					$('body').removeClass(self._inactiveClass);
					self._userActive = true;
				}
				self._lastUserActivity = Date.now();
			}
		});

		//after a 6 second bootup leniency period, start looking for user inactivity
		//That is, don't hide the UI for the first 9 seconds after app load, no matter what.
		setTimeout( function(){
			setInterval(function(){																									//set INACTIVE when...
				if( self._userActivityDetectionEnabled && 														  // activity detection is enabled
					(self._userActive || self._userHoveringActivityIgnore) && 					  // the user's current state is active OR we're ignoring their activity
					!self._userHoveringInactivityPreemption && 													  // the user is not hovering on a special div (i.e. play/pause) where we want to ignore inactivity
					(Date.now() - self._lastUserActivity > self._userInactivityTime) ){		// the user has been inactive for a long enough period of time
				
					$('body').addClass(self._inactiveClass);
					self._userActive = false;
				}
			}, 500);
		}, self._userInactivityBootLeniency);
	
		//When users' mouse is over a control, we don't hide the overlay UI
		$('.inactivity-preemption').live('mouseenter', function(){ self._userHoveringInactivityPreemption = true; });
		$('.inactivity-preemption').live('mouseleave', function(){ self._userHoveringInactivityPreemption = false; });
		//When users' mosue is over the guide, we don't show the overlay UI
		$('.activity-ignore').live('mouseenter', function(){ self._userHoveringActivityIgnore = true; });
		$('.activity-ignore').live('mouseleave', function(){ self._userHoveringActivityIgnore = false; });
		//leaving document doesn't register mouseleave for element, so catch it at the document level...
		$(document).bind('mouseleave', function(){ 
			self._userHoveringInactivityPreemption = false; 
			self._userHoveringActivityIgnore = false;
			});
	
	}
	
});