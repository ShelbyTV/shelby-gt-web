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

	  switch (action){
      case 'Clicked previous search':
        action = 'Clicked previous search on mobile';
        break;
      case 'Removed previous search':
        action = 'Removed previous search on mobile';
        break;
      case 'Clicked promoted search':
        action = 'Clicked promoted search on mobile';
        break;
      case 'Clicked back to search':
        action = 'Clicked back to search on mobile';
        break;
      case 'Clicked share button':
        action = 'Clicked share button on mobile';
        break;
      case 'Clicked video to watch':
        action = 'Clicked video to watch on mobile';
        break;
      case 'Clicked logo':
        action = 'Clicked logo on mobile';
        break;
    };

 		try{
		  //_kmq.push(['record', action]);
			_gaq.push(['_trackEvent', category, action, label]);
		}
		catch(e){};
	});
});