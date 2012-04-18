// Although this is just the single guide hide/show right now, 
// the idea is that this view could be expanded upon to perform more actions.

libs.shelbyGT.GuideOverlayControls = Support.CompositeView.extend({
  
  _userDesires: null,
  
  events : {
    "click .guide-toggle.hide" : "_hideGuide",
    "click .guide-toggle.show" : "_showGuide"
  },
  
  el: '#guide-overlay-controls',
  
  initialize: function(opts){
    this._userDesires = opts.userDesires;
    this.render();
  },
  
  template: function(){
    return JST['guide-overlay-controls']();
  },

	render: function(){
		this.$el.html(this.template());
	},
	
	//--------------------------------------
	// Handle user events
	//--------------------------------------
	
	_hideGuide: function(e){
	  this.$('.guide-toggle').removeClass("hide").addClass("show");
	  //no view owns entire guide, setting class here
	  $('.main').addClass("hide-guide");
	  //other views bind to user desires
	  this._userDesires.set({guideShown: false});
	},
	
	_showGuide: function(el){
	  this.$('.guide-toggle').removeClass("show").addClass("hide");
	  $('.main').removeClass("hide-guide");
	  this._userDesires.set({guideShown: true});
	}
	
});