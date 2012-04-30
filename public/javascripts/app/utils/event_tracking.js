//---------------------------------------------------------
// Google Analytics Event Tracking
// bind click events to buttons and a tags 
// To Use:
// add class 'js-track-event' to element with data attributes for a category, action and label
//---------------------------------------------------------
$(document).ready(function(){
	$('.js-track-event').live('click',function(e){
		try{
			_gaq.push(['_trackEvent', $(e.currentTarget).data("ga_category"), $(e.currentTarget).data("ga_action"), $(e.currentTarget).data("ga_label")]);
		}
		catch(e){};
	});
});