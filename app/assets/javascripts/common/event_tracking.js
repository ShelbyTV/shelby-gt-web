//---------------------------------------------------------
// Google Analytics and KISSMetrics Event Tracking
// bind click events to buttons and a tags 
// To Use:
// add class 'js-track-event' to element with data attributes for a category, action and label
//---------------------------------------------------------
$(document).ready(function(){
	$('.js-track-event').on('click', function(e){
    
	  var action = $(e.currentTarget).data("ga_action");
	  var category = $(e.currentTarget).data("ga_category");
	  var label = $(e.currentTarget).data("ga_label");
	  var kiss_action = action;
	  
	  switch (action){
      case 'Submitted email':
        kiss_action = 'Submitted email on landing page';
        break;
      case 'Beta User Login':
        kiss_action = 'Clicked beta user login on landing page';
        break;
      case 'Login with Twitter':
        kiss_action = 'Login with Twitter on landing page';
        break;
      case 'Login with Facebook':
        kiss_action = 'Login with Facebook on landing page';
        break;
      case 'Not a Beta User':
        kiss_action = "Click not a beta user on landing page";
        break;
    };
	  
	  // Check if visitor is coming via a shl.by short link
	  //  NOTE: this is know because of the url param: ?awesm=shl.by_jk
	  var awesmLink = $.getUrlParam('awesm');
	  if (typeof awesmLink != 'undefined') {
	    category = category + ' via Short Link';
	    kiss_action = action + ' via Short Link';
	    label = awesmLink;
	  }
	  
 		try{
		  _kmq.push(['record', kiss_action]);
			_gaq.push(['_trackEvent', category, action, label]);
		}
		catch(e){};
	});
});