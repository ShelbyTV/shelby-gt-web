//don't need the DOM for this...
BrowserDetect.init();

if( typeof(App) === "undefined" ) var App = {};
$.extend(App, {
		//full client
		Models: {},
		Collections: {},
		Views: { 
			Broadcasts: {},
			Channels: {},
			Guide: {},
			Socializations: {},
			Setup: {},
			Users: {},
			Videos: {}
		},
		Routers: {},
		
		//simple client
		Simple:{
			Views: {
				Guide: {}, 
				Channels: {}
			},
			Routers: {}
		},
		
		_currentUser: null,
		
		//currentChannel is initialized with a default channel.  For now, this is the users only channel.
		//in the future, it may be one of many channels.  But loading all the channels, and changing the current channel
		//will be the job of the ChannelsRouter
		_currentChannel: null,
		
		//used between playback show and controls to communicate state of playback
		_playbackState: null,
		
		_openGraphPostingPercent: 15,
		
		init: function(currentUser, defaultChannel, splashAb, forceSimpleClient) {

			if (currentUser){
				this._currentUser = currentUser;
			} else {
				this._currentUser = new App.Models.User({anonymous: true, nickname: "anonymous"});
				App.trackEvent("Splash", "Visit", "Non-Logged-In User");
			}

			
			this._currentChannel = defaultChannel || new App.Models.Channel();
			if( defaultChannel === null ){ this._currentChannel.setReadyForRouting(true); }
			this._splashAb = splashAb;
			
			if( forceSimpleClient || !Browser.supportsFullClient() ){
				//simplified static app
				this._initSimpleClient();
			} else {
				//traditional web app
				this._initFullClient();
			}
		},
		
		_initFullClient: function(){
			this._fullClient = true;
			
			this._playbackState = new App.Models.PlaybackState();
			
			// Async communications choke point, so the app can react globally to errors and the such
			AsyncMiddleman.initialize();
			
			//Our router and views for the applications, which all operate on the channel/broadcasts model conglomeration
			this._channelsRouter = new App.Routers.Channels(this._currentChannel);
			//---guide views---
			this._guideGlobalHeader = new App.Views.Guide.GlobalHeader({ model: this._currentChannel });
			this._guideUserBarView = new App.Views.Users.UserBar({ model: this.getCurrentUser() });
			this._guideUserSettingsView = new App.Views.Users.SettingsPane({ model: this.getCurrentUser() });
			this._broadcastBufferingView = new App.Views.Broadcasts.BufferingPane({ playbackState: this._playbackState });
			this._guideChannelNav = new App.Views.Channels.GuideChannelNav({ model: this._currentChannel });
			//---main view---
			this._videoShowView = new App.Views.Videos.Show({ model: this._currentChannel, playbackState: this._playbackState });
			this._playerControls = new App.Views.Broadcasts.PlayerControls({ model: this._currentChannel, playbackState: this._playbackState });
			this._channelShowView = new App.Views.Channels.Show({ model: this._currentChannel });
			this._broadcastTitleView = new App.Views.Broadcasts.Title({ model: this._currentChannel });
			this._broadcastPausedView = new App.Views.Broadcasts.PausedPane({ model: this.getCurrentUser(), playbackState: this._playbackState, forceLogoOnly: Browser.isIframe() && !Browser.isFacebook() });
			this._broadcastErrorView = new App.Views.Broadcasts.ErrorPane({ model: this._currentChannel, playbackState: this._playbackState });
			this._broadcastComingUpView = new App.Views.Broadcasts.ComingUp({ model: this._currentChannel });
			this._broadcastWatchLaterUpdater = new App.Views.Broadcasts.WatchLaterUpdater({ model: this._currentChannel, playbackState: this._playbackState });
			// create an opt-in pane only if the user has FB and hasn't opted in (or out) yet
 			if (this.userSignedIn() && this._currentUser.hasAuthentication('facebook') && typeof this._currentUser.get('preferences')['quiet_mode'] === 'undefined' && !(Browser.isIframe() && !Browser.isFacebook()) ){
			this._optInPaneView = new App.Views.Users.OptInPane({ model: this.getCurrentUser() });
		}

			//---global views---
			// sharing (i.e. socializations/new) is created by the player controls or the broadcasts
			
			// Hide side bar if app loaded in iframe
			if (Browser.isIframe() && !Browser.isFacebook()){ Backbone.Events.trigger("guide:hide"); }
			
			Backbone.history.start();
			
			try{this._pageTracker = _gat._createTracker("UA-21191360-1");}catch(e){}
			
			this._initializeUserActivityDetection();
			this._initializeHotkeys();
			
			if( !(location && location.hostname == "localhost") ){
				if( App.getCurrentUser().isNotAnonymous() ){ 
					//initialze web sockets for live updates
					//This will probably need to change... need to get updates for channel(s), not a user.
					App.WebsocketManager.init(App.getCurrentUser().id); 
					
					var clientType = "web";
					if (Browser.isBoxee()){ clientType = "web-boxee"; }
					
					Cobra.initialize({
						url: "http://cobra.shelby.tv/v1/jsonp/sessions",
						crossDomain: true,
						toPost: { user_id: App.getCurrentUser().id, client: clientType }
					});
					//track playing vs. non-playing
					this._playbackState.bind("change:playing", function(playbackState){ Cobra.update({'playing': playbackState.isPlaying()}); });
					//track user active vs. inactive
					Backbone.Events.bind("user:active", function(active){ Cobra.update({'activity': active}); });
					Cobra.start();
				}
			}
			
			if (Browser.isBoxee()){
				//boxee.exec('boxee.setMode(boxee.KEYBOARD_MODE);');
				$(".sign-in-with-twitter").focus();
				this._boxee_nav_to = 'twitter';
				this.boxeeLayer = new BoxeeLayer();
				
				/* the channel is refreshed, so we want to make sure things are right after   */
				var self = this;
				this._currentChannel.bind("refresh", function(){ 
					setTimeout(function(){
						$('#search').hide();
						self.boxeeLayer = new BoxeeLayer();
					},4000);
				});
			}
			
			//determination of showing Splash vs. App is handled by ChannelsRouter which calls one of the reveal* methods, below
		},
		
		_initSimpleClient: function(){
			this._simpleClient = true;
			
			//---router--- super simple router in this client, no continuous playback
			this._simpleChannelsRouter = new App.Simple.Routers.Channels(this._currentChannel);
			
			//---guide views--- (take over the entire viewport, so no "main" view)
			this._simpleGuideHeader = new App.Simple.Views.Guide.Header({ model: this._currentChannel });
			this._simpleChannelNav = new App.Simple.Views.Channels.ChannelNav({ model: this._currentChannel });
			
			Backbone.history.start();
			
			//determination of showing Splash vs. Simple App is handled by Simple Channels Router which calls one of the reveal* methods, below
		},
		
		
		//-------------------------------------------------------
		// reveal the App views or the Splash views
		//  (initially, both are hidden so ChannelsRouter can make the decision)
		// -OR-
		// reveal the simple app views
		//-------------------------------------------------------

		revealApp: function(){
			// *must remain idempotent* as this is called often by ChannelsRouter
			if( $("body").hasClass("hide-app") ){
				$("body").removeClass("hide-app");
				$("body").addClass("hide-splash");
				$("html, body").css('width', '100%').css('height', '100%').css('overflow', 'hidden');
			
				//initialize layout (idempotently)
				App.initializeApplicationLayout();
			}
		},
		
		revealSimpleApp: function(){
			// is idempotent, though it's only called once by initSimpleApp
			if( $("body").hasClass("hide-simple-app") ){
				$("body").removeClass("hide-simple-app");
				$("body").addClass("hide-splash");
			}
		},
		
		revealSplash: function(){
			// not idempotent.  This will be called once at most by ChannelsRouter
			$("body").removeClass("hide-splash");
			$("body").addClass("hide-app");
			$("#splash-holder").html( JST['shared/_splash']({ splashAb: this._splashAb }));
		},
		
		
		//-------------------------------------------------------
		// Async loading of initial broadcasts (after app is loaded)
		//-------------------------------------------------------
		
		initBroadcasts: function(initAttempt){
			var bcastLimit = 200, self = this;
			if( Browser.isBoxee() ){ bcastLimit = 25; }
			if( this._simpleClient ){ bcastLimit = 25; }

			//get broadcasts for default channel
			$.getJSON(this._currentChannel.url(), {
				limit: bcastLimit, 
				include_watchlater_liked: true}, 
				function(resp){
					self._currentChannel.populateBroadcasts(resp.broadcasts);
					self._currentChannel.trigger('refresh');
					//handle the current URL which wasn't handled (properly) earlier
					setTimeout(function(){ Backbone.history.loadUrl(); }, 100);
					
					/*  It's especially possible for new users to miss lots of video due to timing issues.
					 *  If they sign up, this returns (with 1 broadcast b/c of slightly stale replcia) and
					 *  they've missed the websockets update, their initial load of broadcasts will be totally missed.
					 *  That sucks.  So, we wait a little bit and try to re-initBroadcasts.
					 */
					if(resp.broadcasts.length < 3 && initAttempt < 2){
						setTimeout(function(){App.initBroadcasts(initAttempt+1);}, 5000); 
					}
				});
		},


		//-------------------------------------------------------
		// Global utility methods
		//-------------------------------------------------------
		
		getCurrentPlaybackTime: function(){
			return App._videoShowView.getCurrentPlaybackTime();
		},
		
		getCurrentUser: function(){
			//created on home/nos page
			return App._currentUser;
		},
		
		userSignedIn: function(){
			return App._currentUser !== null && App._currentUser.isNotAnonymous();
		},
		
		
		//-------------------------------------------------------
		// Data tracking
		//-------------------------------------------------------

		trackEvent: function(category, action, label, value){
			if (typeof this._pageTracker != "undefined") {
				this._pageTracker._trackEvent(category, action, label, value);
			}
		},

		//---------------------------------------------------------
		// Cookie Monster love cookie
		//---------------------------------------------------------
		setCookie: function(c_name,value,expiredays){
			var exdate=new Date();
			exdate.setDate(exdate.getDate()+expiredays);
			document.cookie=c_name+ "=" +escape(value)+((expiredays===null) ? "" : ";expires="+exdate.toUTCString());
		},

		getCookie: function(c_name){
			if (document.cookie.length>0) {
				c_start=document.cookie.indexOf(c_name + "=");
				if (c_start!=-1) {
					c_start=c_start + c_name.length+1;
					c_end=document.cookie.indexOf(";",c_start);
					if (c_end==-1) c_end=document.cookie.length;
					return unescape(document.cookie.substring(c_start,c_end));
				}
			}
			return "";
		}		
});


/** 
General purpose google analytics event tracking.
TO USE: add class, 'track-event' to link you want.  add data attributes: data-ga_category, -ga_action, and -ga_label
		with desired values
**/
$('a.track-event').live('click', function(e) {
	App.trackEvent($(e.currentTarget).data("ga_category"), $(e.currentTarget).data("ga_action"), $(e.currentTarget).data("ga_label"));
});


/** 
	Tweet character counting (see  /app/views/socializations/new.jst ) 
**/
$(".post-pane form textarea[name=comment]").live('keyup change focus', function(e){
	var commentTextArea = $(e.currentTarget);
	var characterCountEl = commentTextArea.parent('form').children('.character-count');
	var charsLeft = 140 - commentTextArea.val().length;
	var remarks = ['the perfect tweet!', 'nailed it.', 'honeymoon fit.', '...like a glove.', "I don't always tweet, but when I do, it's 140 characters.", "best. tweet. ever.", "dead on balls accurate."];
	
	characterCountEl.text( ''+charsLeft );
	if( charsLeft === 0){ characterCountEl.text(remarks[Math.floor(Math.random()*remarks.length)]); }
	
	if( charsLeft < 0 ){
		characterCountEl.addClass("invalid");
	} else {
		characterCountEl.removeClass("invalid");
	}
});

/** 
	Auto-hide character counting (see  /app/views/socializations/new.jst ) 
**/
$(".post-pane form input[type=checkbox].twitter").live('change', function(e){
	var twitterCheckbox = $(e.currentTarget);
	var characterCountEl = twitterCheckbox.parents('form').children('.character-count');
	
	if( twitterCheckbox.is(':checked') ){
		characterCountEl.show();
	} else {
		characterCountEl.hide();
	}
});

/**
	oAuth via popup window
**/
$("a.auth-popup").live('click', function(e){
	if( Browser.supportsAuthPopup() ){
		var width = $(this).attr('popup-width');
		var height = $(this).attr('popup-height');
		var left = (screen.width/2)-(width/2);
		var top = (screen.height/2)-(height/2);

		window.open($(this).attr("href"), "authPopup", "menubar=no,toolbar=no,status=no,width="+width+",height="+height+",toolbar=no,left="+left+",top="+top);
		e.stopPropagation(); return false;
	}
});
