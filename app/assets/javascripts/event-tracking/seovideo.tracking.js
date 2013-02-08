//---------------------------------------------------------
// Google Analytics and KISSMetrics Event Tracking
// bind click events to buttons and a tags
// To Use:
// add class 'js-track-event' to element with data attributes for a category, action and label
//---------------------------------------------------------

// 02/08/13 (HIS)
// TURNING OFF ALL TRACKING ON SEO FOR THE TIME BEING TO REDUCE # EVENTS SENT TO KISS

/*$(document).ready(function(){
	$('.js-track-event').on('click', function(e){

    var action = $(e.currentTarget).data("ga_action");
    var category = $(e.currentTarget).data("ga_category");
    var label = $(e.currentTarget).data("ga_label");

    try {
			_gaq.push(['_trackEvent', category, action, label]);

      var kmq_action = action + ' on ' + category;

      _kmq.push(['record', kmq_action]);
    }

    catch(e){};
	});
});*/