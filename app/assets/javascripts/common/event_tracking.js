//---------------------------------------------------------
// Google Analytics and KISSMetrics Event Tracking
// bind click events to buttons and a tags 
// To Use:
// add class 'js-track-event' to element with data attributes for a category, action and label
//---------------------------------------------------------
$(document).ready(function(){
	$('.js-track-event').live('click',function(e){
	  
	  var action = $(e.currentTarget).data("ga_action");
	  var category = $(e.currentTarget).data("ga_category");
	  var label = $(e.currentTarget).data("ga_label");
	  
	  if (typeof $.getUrlParam('awesm') != 'undefined')
	  
	  switch (action){
      case 'Submitted email':
        _kmq.push(['record', action]);
        break;
      case 'beta_user_login':
        _kmq.push(['record', 'click beta user login']);
        break;
      case 'login w twitter':
        _kmq.push(['record', 'twitter login on landing page']);
        break;
      case 'login w facebook':
        _kmq.push(['record', 'facebook login on landing page']);
        break;
      case 'identify':
        _kmq.push(['identify', options.nickname]);
        break;
    };
	  
		try{
			_gaq.push(['_trackEvent', category, action, label]);
		}
		catch(e){};
	});
});