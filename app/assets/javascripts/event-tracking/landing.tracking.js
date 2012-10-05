//---------------------------------------------------------
// Google Analytics and KISSMetrics Event Tracking
// bind click events to buttons and a tags 
// To Use:
// add class 'js-track-event' to element with data attributes for a category, action and label
//---------------------------------------------------------
$(document).ready(function(){
    
  shelbyTrackEventWithGlobalCategory = function(action, label){
    var category = shelbyTrackingCategory;
    action = action + " on " + category;
    
    // Check if visitor is coming via a shl.by short link
	  //  NOTE: this is know because of the url param: ?awesm=shl.by_jk
	  var awesmLink = $.getUrlParam('awesm');
	  if (typeof awesmLink != 'undefined') {
	    category = category + ' via Short Link';
	    action = action + ' via Short Link';
	    label = awesmLink;
	  }

 		try{
		  _kmq.push(['record', action]);
			_gaq.push(['_trackEvent', category, action, label]);
		}
		catch(e){};
  };

  
	$('.js-track-event').on('click', function(e){	  
	  shelbyTrackEventWithGlobalCategory($(e.currentTarget).data("ga_action"),
	                                     $(e.currentTarget).data("ga_label"));
	});
	
	$('form.js-track-submit').on('submit', function(e){
	  shelbyTrackEventWithGlobalCategory($(e.currentTarget).data("ga_action"),
	                                     $(e.currentTarget).data("ga_label"));
	});
});