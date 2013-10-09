//---------------------------------------------------------
// Google Analytics and KISSMetrics Event Tracking
// bind click events to buttons and a tags
// To Use:
// add class 'js-track-event' to element with data attributes for a category, action and label
//---------------------------------------------------------

$(document).ready(function(){
  $('.js-track-event').on('click', function(e){
    var action = $(e.currentTarget).data("ga_action");
    var category = shelbyTrackingCategory || $(e.currentTarget).data("ga_category");
    var label = $(e.currentTarget).data("ga_label");
    var value = $(e.currentTarget).data("ga_value") || 0;

    try {
      _gaq.push(['_trackEvent', category, action, label, value]);
    }
    catch(e) {}
  });


});
