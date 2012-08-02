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

_(shelby).extend({
  track : function(action, options){
    var _category, _action;
    
    switch (action){
      case 'commented':
        _action = 'commented'; _category = 'Frame';
        _kmq.push(['record', action, {'frame': options.id}]);
        break;
      case 'shared_roll':
        _action = 'shared'; _category = 'Roll'; 
        _kmq.push(['record', 'shared', {'outbound destination': options.destination, 'roll': options.id }]);
        break;
      case 'shared_frame':
        _action = 'shared'; _category = 'Frame';
        _kmq.push(['record', 'shared', {'outbound destination': options.destination, 'frame': options.id }]);
        break;
      case 'heart_video':
        _action = 'hearted'; _category = 'Frame';
        _kmq.push(['record', action, {'frame': options.id}]);
        break;
      case 'left_roll':
        _action = 'left'; _category = 'Roll'; 
        _kmq.push(['record', action, {'roll': options.id}]);
        break;
      case 'joined_roll':
        _action = 'joined'; _category = 'Roll';
        _kmq.push(['record', action, {'roll': options.id}]);
        break;
      case 'add_to_roll':
        _action = 'rolled'; _category = 'Frame';
        _kmq.push(['record', action, {'frame': options.frameId, 'roll': options.rollId}]);
        break;
      case 'identify':
        _kmq.push(['identify', options.nickname]);
        break;
      default:
        _action = 'unknown';
        _category = 'unknown';
    };
    
    try {
      _gaq.push(['_trackEvent', _category, _action, options.userName]);
    } catch(e){};
    
  }
});