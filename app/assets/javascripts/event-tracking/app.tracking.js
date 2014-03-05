//---------------------------------------------------------
// Google Analytics Event Tracking
// bind click events to buttons and a tags
// To Use:
// add class 'js-track-event' to element with data attributes for a category, action and label
//---------------------------------------------------------

if (typeof(shelby) == 'undefined') {
    shelby = {};
}
if (typeof(shelby.tracking) == 'undefined') {
    shelby.tracking = {};
}

// a queue of strings, each one representing the description of a type of frame that was displayed,
// like "Frame", "Frame - Recommended", or "Frame - Search"
shelby.tracking.displayedFrameTypesQueue = [];

$(document).ready(function() {
    // set up click tracking handler
    $(document).on('touchstart click', '.js-track-event', function(e) {
        try {
            _gaq.push(['_trackEvent', $(e.currentTarget).data("ga_category"), $(e.currentTarget).data("ga_action"), $(e.currentTarget).data("ga_label")]);
            //_kmq.push(['record', $(e.currentTarget).data("ga_action")]);
        } catch (e) {}
    });

    // set up periodic tracking of the number of different types of frames that have been displayed
    setInterval(function() {
        // if any frames have been displayed since the last interval
        if (shelby.tracking.displayedFrameTypesQueue.length) {
            // count the number frames of each type that were displayed
            frameTypeCounts = _(shelby.tracking.displayedFrameTypesQueue).countBy(function(stringVal) {
                return stringVal;
            });
            _(frameTypeCounts).each(function(value, key) {
                // track one event with the count for each frame type
                shelby.trackEx({
                    providers: ['ga'],
                    gaCategory: key,
                    gaAction: 'displayed',
                    gaLabel: shelby.models.user.get('nickname'),
                    gaValue: value,
                });
            });
            // reset the queue so it can start collecting a new record of types of frames displayed until the next tracking interval
            shelby.tracking.displayedFrameTypesQueue.length = 0;
        }
    }, 3000);

});

_(shelby).extend({
    track: function(action, options) {
        options = _.extend({}, options);

        var _gaCategory, _gaAction, _gaLabel = options.userName;

        try {
            switch (action) {
                case 'commented':
                    _gaAction = 'commented';
                    _gaCategory = 'Frame';
                    //_kmq.push(['record', action, {'frame': options.id}]);
                    break;
                case 'shared_roll':
                    _gaAction = 'shared';
                    _gaCategory = 'Roll';
                    //_kmq.push(['record', 'shared', {'outbound destination': options.destination, 'roll': options.id }]);
                    break;
                case 'shared_frame':
                    _gaAction = 'shared';
                    _gaCategory = 'Frame';
                    //_kmq.push(['record', 'shared', {'outbound destination': options.destination, 'frame': options.id }]);
                    break;
                case 'heart_video':
                    _gaAction = 'hearted';
                    _gaCategory = 'Frame';
                    //_kmq.push(['record', action, {'frame': options.id}]);
                    break;
                case 'left_roll':
                    _gaAction = 'left';
                    _gaCategory = 'Roll';
                    //_kmq.push(['record', action, {'roll': options.id}]);
                    break;
                case 'joined_roll':
                    _gaAction = 'joined';
                    _gaCategory = 'Roll';
                    //_kmq.push(['record', action, {'roll': options.id}]);
                    break;
                case 'add_to_roll':
                    _gaAction = 'rolled';
                    _gaCategory = 'Frame';
                    //_kmq.push(['record', action, {'frame': options.frameId, 'roll': options.rollId}]);
                    break;
                case 'add_to_queue':
                    _gaAction = 'queued';
                    _gaCategory = 'Frame';
                    //_kmq.push(['record', action, {'frame': options.frameId}]);
                    break;
                case 'liked':
                    _gaAction = 'liked';
                    _gaCategory = 'Frame';
                    //_kmq.push(['record', action, {'frame': options.frameId}]);
                    break;
                case 'liked on search':
                    _gaAction = 'liked';
                    _gaCategory = 'search';
                    //_kmq.push(['record', action, {'frame': options.frameId}]);
                    break;
                case 'watched':
                    options.pctWatched = options.pctWatched ? options.pctWatched.toFixed() : null;
                    _gaAction = 'watched';
                    _gaCategory = 'Frame';
                    ////_kmq.push(['record', action, {'frame': options.frameId, 'pctWatched': options.pctWatched}]);
                    // extra watch event tracking to capture frame and roll popularity
                    _gaq.push(['_trackEvent', "Watched", options.rollId, options.frameId]);
                    break;
                case 'watched in full':
                    _gaAction = 'watched in full';
                    _gaCategory = 'Frame';
                    ////_kmq.push(['record', action, {'frame': options.frameId, 'pctWatched': 100} ]);
                    break;
                case 'started onboarding':
                    _gaAction = action;
                    _gaCategory = 'Onboarding';
                    //_kmq.push(['record', action, {nickname: options.userName} ]);
                    break;
                case 'Onboarding step 2 complete':
                    _gaAction = action;
                    _gaCategory = 'Onboarding';
                    //_kmq.push(['record', action, {nickname: options.userName} ]);
                    break;
                case 'Onboarding step 3 complete':
                    _gaAction = action;
                    _gaCategory = 'Onboarding';
                    //_kmq.push(['record', action, {nickname: options.userName} ]);
                    break;
                case 'FB Timeline App Preference set to true':
                    _gaAction = "FB timeline app preference set";
                    _gaCategory = 'Onboarding';
                    _gaLabel = "Opt in";
                    //_kmq.push(['record', action, {nickname: options.userName} ]);
                    break;
                case 'FB Timeline App Preference set to false':
                    _gaAction = "FB timeline app preference set";
                    _gaCategory = 'Onboarding';
                    _gaLabel = "Opt out";
                    //_kmq.push(['record', action, {nickname: options.userName} ]);
                    break;
                case 'Follow Shelby':
                    _gaAction = "Follow @Shelby";
                    _gaCategory = 'Onboarding';
                    _gaLabel = options.userName;
                    //_kmq.push(['record', action, {nickname: options.userName} ]);
                    break;
                case 'completed onboarding':
                    _gaAction = action;
                    _gaCategory = 'Onboarding';
                    //_kmq.push(['record', action, {nickname: options.userName} ]);
                    break;
                case 'identify':
                    //_kmq.push(['identify', options.nickname]);
                    if (options.nickname !== "anonymous") {
                        //_kmq.push(['record', 'Visit App signed in', {nickname: options.nickname}]);
                    } else {
                        //_kmq.push(['record', 'Visit App signed out', {nickname: options.nickname}]);
                    }
                    break;
                case 'avatar_upload_success':
                    _gaCategory = 'Avatar';
                    _gaAction = "Upload success";
                    //_kmq.push(['record', action, {nickname: options.userName}]);
                    break;
                case 'avatar_upload_fial':
                    _gaCategory = 'Avatar';
                    _gaAction = "Upload fail";
                    //_kmq.push(['record', action, {nickname: options.userName}]);
                    break;
                case 'Click community promo':
                case 'Show community promo':
                    _gaCategory = 'Promo';
                    _gaAction = action;
                    _gaLabel = 'community';
                    ////_kmq.push(['record', action, {label: 'community'}]);
                    break;
                case 'Click roll promo':
                case 'Show roll promo':
                case 'Click donate promo':
                case 'Show donate promo':
                    _gaCategory = 'Promo';
                    _gaAction = action;
                    _gaLabel = options.id;
                    ////_kmq.push(['record', action, {roll: options.id}]);
                    break;
                default:
                    _gaAction = 'unknown';
                    _gaCategory = 'unknown';
            }
            _gaq.push(['_trackEvent', _gaCategory, _gaAction, _gaLabel]);
        } catch (e) {}

    },

    trackEx: function(options) {
        // default options
        options = _.chain({}).extend(options).defaults({
            providers: ['ga']
        }).value();

        if (_(options.providers).contains('ga') && options.gaCategory) {
            try {
                if (_(options).has('gaValue')) {
                    _gaq.push(['_trackEvent', options.gaCategory, options.gaAction, options.gaLabel, options.gaValue]);
                } else {
                    _gaq.push(['_trackEvent', options.gaCategory, options.gaAction, options.gaLabel]);
                }
            } catch (e) {
                $.noop();
            }
        }
        var kmqName = options.kmqName || options.gaAction;
        if (_(options.providers).contains('kmq') && kmqName) {
            try {
                //_kmq.push(['record', kmqName, _({}).extend(options.kmqProperties)]);
            } catch (e) {
                $.noop();
            }
        }
    }
});
