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
    $(document).on('click', '.js-track-event', function(e) {
        try {
            _gaq.push(['_trackEvent', $(e.currentTarget).data("ga_category"), $(e.currentTarget).data("ga_action"), $(e.currentTarget).data("ga_label")]);
            //_kmq.push(['record', $(e.currentTarget).data("ga_action")]);
        } catch (e) {}
    });
});

_(shelby).extend({
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
