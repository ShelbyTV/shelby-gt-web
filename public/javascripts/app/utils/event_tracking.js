//---------------------------------------------------------
// Google Analytics Event Tracking
// bind click events to buttons and a tags 
//---------------------------------------------------------
$(document).ready(function(){
	$('button.js-track-event, a.js-track-event').live('click',function(e){
		try{
			_gaq.push(['_trackEvent', $(e.currentTarget).data("ga_category"), $(e.currentTarget).data("ga_action"), $(e.currentTarget).data("ga_label")]);
		}
		catch(e){ console.log(e) };
	});
});