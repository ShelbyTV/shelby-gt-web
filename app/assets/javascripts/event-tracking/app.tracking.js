//---------------------------------------------------------
// Google Analytics Event Tracking
// bind click events to buttons and a tags
// To Use:
// add class 'js-track-event' to element with data attributes for a category, action and label
//---------------------------------------------------------
$(document).ready(function(){
	$(document).on('click', '.js-track-event', function(e){
		try{
			_gaq.push(['_trackEvent', $(e.currentTarget).data("ga_category"), $(e.currentTarget).data("ga_action"), $(e.currentTarget).data("ga_label")]);
			_kmq.push(['record', $(e.currentTarget).data("ga_action")]);
		}
		catch(e){}
	});
});

_(shelby).extend({
  track : function(action, options){
    options = _.extend({}, options);

    var _gaCategory, _gaAction, _gaLabel = options.userName;

    try {
      switch (action){
        case 'commented':
          _gaAction = 'commented'; _gaCategory = 'Frame';
          _kmq.push(['record', action, {'frame': options.id}]);
          break;
        case 'shared_roll':
          _gaAction = 'shared'; _gaCategory = 'Roll';
          _kmq.push(['record', 'shared', {'outbound destination': options.destination, 'roll': options.id }]);
          break;
        case 'shared_frame':
          _gaAction = 'shared'; _gaCategory = 'Frame';
          _kmq.push(['record', 'shared', {'outbound destination': options.destination, 'frame': options.id }]);
          break;
        case 'heart_video':
          _gaAction = 'hearted'; _gaCategory = 'Frame';
          _kmq.push(['record', action, {'frame': options.id}]);
          break;
        case 'left_roll':
          _gaAction = 'left'; _gaCategory = 'Roll';
          _kmq.push(['record', action, {'roll': options.id}]);
          break;
        case 'joined_roll':
          _gaAction = 'joined'; _gaCategory = 'Roll';
          _kmq.push(['record', action, {'roll': options.id}]);
          break;
        case 'add_to_roll':
          _gaAction = 'rolled'; _gaCategory = 'Frame';
          _kmq.push(['record', action, {'frame': options.frameId, 'roll': options.rollId}]);
          break;
        case 'add_to_queue':
          _gaAction = 'queued'; _gaCategory = 'Frame';
          _kmq.push(['record', action, {'frame': options.frameId, 'roll': options.rollId}]);
          break;
        case 'watched':
          options.pctWatched = options.pctWatched ? options.pctWatched.toFixed() : null;
          _gaAction = 'watched'; _gaCategory = 'Frame';
          _kmq.push(['record', action, {'frame': options.frameId, 'videoDuration': options.videoDuration, 'pctWatched': options.pctWatched}]);
          // extra watch event tracking to capture frame and roll popularity
          _gaq.push(['_trackEvent', "Watched", options.rollId, options.frameId]);
          break;
        case 'watched in full':
          _gaAction = 'watched in full'; _gaCategory = 'Frame';
          _kmq.push(['record', action, {'frame': options.frameId, 'videoDuration': options.videoDuration, 'pctWatched': 100} ]);
          break;
        case 'started onboarding':
          _gaAction = action; _gaCategory = 'Onboarding';
          _kmq.push(['record', action, {nickname: options.userName} ]);
          break;
        case 'Onboarding step 2 complete':
          _gaAction = action; _gaCategory = 'Onboarding';
          _kmq.push(['record', action, {nickname: options.userName} ]);
          break;
        case 'Onboarding step 3 complete':
          _gaAction = action; _gaCategory = 'Onboarding';
          _kmq.push(['record', action, {nickname: options.userName} ]);
          break;
        case 'completed onboarding':
          _gaAction = action; _gaCategory = 'Onboarding';
          _kmq.push(['record', action, {nickname: options.userName} ]);
          break;
        case 'identify':
          _kmq.push(['identify', options.nickname]);
          _kmq.push(['record', 'Visit App', {nickname: options.nickname}]);
          break;
        case 'avatar_upload_success':
          _gaCategory = 'Avatar';
          _gaAction = "Upload success";
          _kmq.push(['record', action, {nickname: options.userName}]);
          break;
        case 'avatar_upload_fial':
          _gaCategory = 'Avatar';
          _gaAction = "Upload fail";
          _kmq.push(['record', action, {nickname: options.userName}]);
          break;
        case 'Click explore promo':
        case 'Show explore promo':
          _gaCategory = 'Promo';
          _gaAction = action;
          _gaLabel = 'explore';
          _kmq.push(['record', action, {label: 'explore'}]);
          break;
        case 'Click roll promo':
        case 'Show roll promo':
          _gaCategory = 'Promo';
          _gaAction = action;
          _gaLabel = options.id;
          _kmq.push(['record', action, {roll: options.id}]);
          break;
        default:
          _gaAction = 'unknown';
          _gaCategory = 'unknown';
      }
      _gaq.push(['_trackEvent', _gaCategory, _gaAction, _gaLabel]);
    } catch(e){}

  }
});