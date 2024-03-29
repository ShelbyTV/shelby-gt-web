if(typeof(shelby.userInactivity) === "undefined" ) shelby.userInactivity = {};

$.extend(shelby.userInactivity, {

  //-------------------------------------------------------
  // User Inactivity
  //-------------------------------------------------------
  //
  // After X seconds of user inactivity, adds the class .user-inactive to the body element.
  // Upon resumed user activity, removes the class .user-inactive from the body element.
  // When the mouse is left within any div with class .js-inactivity-preemption, do not set inactivity on body
  // When the mouse is active in any div with class .js-activity-ignore, do not count towards activity

  _lastUserActivity: Date.now(),
  _userActive: true,
  _userInactivityTime: 1.5 * 1000,
  _userInactivityBootLeniency: 7 * 1000,
  _userActivityDetectionEnabled: true,
  _numActivityDetectionDisablers: 0,
  _userHoveringInactivityPreemption: false,
  _userHoveringActivityIgnore: false,
  _inactiveClass: "user-inactive",

  disableUserActivityDetection: function(){
    if (!this._numActivityDetectionDisablers) {
      this._userActivityDetectionEnabled = false;
      $('body').removeClass("user-inactive");
      this._userActive = true;
    }
    this._numActivityDetectionDisablers++;
  },

  enableUserActivityDetection: function(){
    if (this._numActivityDetectionDisablers) {
      this._numActivityDetectionDisablers--;
    }
    if (!this._numActivityDetectionDisablers) {
      this._lastUserActivity = Date.now();
      this._userActivityDetectionEnabled = true;
    }
  },

  toggleUserActivityDetection: function(userDesires){
    var guideIsShowing = userDesires.get('guideShown');

    if(guideIsShowing) {
      this.disableUserActivityDetection();
    } else {
      this.enableUserActivityDetection();
    }
  },

  init: function(){
    var self = this;

    this._userDesires = shelby.models.userDesires;

    if(shelby.config.ua.isAppEnabled()) {
      this._userDesires.bind('change:guideShown',this.toggleUserActivityDetection,this);
    }

    //listen for activity
    $(document).bind('focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup', function(){
      //if we're not ignoring activity
      if( !self._userHoveringActivityIgnore)  {
        if( !self._userActive ){
          //update class and status if the user is currently inactive
          $('body').removeClass(self._inactiveClass);
          self._userActive = true;
        }
        self._lastUserActivity = Date.now();
      }
    });

    //after a X second bootup leniency period, start looking for user inactivity
    //That is, don't hide the UI for the first X+n seconds after app load, no matter what.
    setTimeout( function(){
      setInterval(function(){                                                 //set INACTIVE when...
        if( self._userActivityDetectionEnabled &&                               // activity detection is enabled
          (self._userActive || self._userHoveringActivityIgnore) &&             // the user's current state is active OR we're ignoring their activity
          !self._userHoveringInactivityPreemption &&                            // the user is not hovering on a special div (i.e. play/pause) where we want to ignore inactivity
          (Date.now() - self._lastUserActivity > self._userInactivityTime) ){   // the user has been inactive for a long enough period of time

          $('body').addClass(self._inactiveClass);
          self._userActive = false;
        }
      }, 500);
    }, self._userInactivityBootLeniency);

    //When users' mouse is over a control, we don't hide the overlay UI
    $('.js-inactivity-preemption').live('mouseenter', function(){ self._userHoveringInactivityPreemption = true; });
    $('.js-inactivity-preemption').live('mouseleave', function(){ self._userHoveringInactivityPreemption = false; });
    //When users' mosue is over the guide, we don't show the overlay UI
    $('.js-activity-ignore').live('mouseenter', function(){ self._userHoveringActivityIgnore = true; });
    $('.js-activity-ignore').live('mouseleave', function(){ self._userHoveringActivityIgnore = false; });
    //leaving document doesn't register mouseleave for element, so catch it at the document level...
    $(document).bind('mouseleave', function(){
      self._userHoveringInactivityPreemption = false;
      self._userHoveringActivityIgnore = false;
      });

  },

  _cleanup: function(){
    if(shelby.config.ua.mobileOs == shelby.config.ua.windows) {
      this._userDesires.unbind('change:guideShown',this.toggleUserActivityDetection,this);
    }
  }


});
