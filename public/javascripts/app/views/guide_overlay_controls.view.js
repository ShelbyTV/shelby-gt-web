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
    this._userDesires.bind('change:guideShown', this._guideVisibilityChange, this);
    
    this.render();
  },
  
  _cleanup: function() {
	  this._userDesires.unbind('change:guideShown', this._guideVisibilityChange, this);
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
	  this._userDesires.set({guideShown: false});
	},
	
	_showGuide: function(el){
	  this._userDesires.set({guideShown: true});
	},
	
	//--------------------------------------
	// handle user desires
	//--------------------------------------
	
	_guideVisibilityChange: function(attr, guideShown){
	  //no view owns entire guide, so I'm setting classes in here
    if( guideShown ){
      this.$('.guide-toggle').removeClass("show").addClass("hide");
  	  $('.main').removeClass("hide-guide");
    } else {
      this.$('.guide-toggle').removeClass("hide").addClass("show");
  	  $('.main').addClass("hide-guide");
    }
  }
	
});