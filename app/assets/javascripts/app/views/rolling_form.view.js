/*
 * This form is Step 2 in the rolling process.
 * It handles two cases when rolling: create new roll, roll to existing roll.
 *
 * FrameRollingView, our parent, set itself up for step one (choosing new or existing roll).
 * We will perform the actual rolling and sharing, updating our parent view via ShareActionStateModel.
 *
 */
(function() {

    var BackboneCollectionUtils = libs.utils.BackboneCollectionUtils;
    var MessageModel = libs.shelbyGT.MessageModel;
    var RollFollowingsConfig = shelby.config.db.rollFollowings;
    var RollModel = libs.shelbyGT.RollModel;
    var RollViewHelpers = libs.shelbyGT.viewHelpers.roll;
    var ShareActionState = libs.shelbyGT.ShareActionState;
    var ShareActionStateModel = libs.shelbyGT.ShareActionStateModel;
    var ShelbyAutocompleteView = libs.shelbyGT.ShelbyAutocompleteView;

    libs.shelbyGT.RollingFormView = Support.CompositeView.extend({

        events: {
            "click .js-share-it": '_doShare',
            "focus #js-sharing-message": '_clearErrors',
            "click .js-facebook-post": '_shareToFacebook',
            "change .js-toggle-twitter-sharing": '_toggleCheckboxButton',
            "change .js-toggle-facebook-sharing": '_toggleCheckboxButton',
            "click .js-toggle-comment": "_toggleComment",
        },

        className: 'rolling-form',

        template: function(obj) {
            return SHELBYJST['rolling-form'](obj);
        },

        initialize: function() {
            this._frameRollingState = new ShareActionStateModel();
            this._roll = this.options.roll;
            this._frame = this.options.frame;
            this._video = this.options.frame.get('video');
            this._dashboardEntry = this.options.dashboardEntry;
        },

        render: function() {
            var self = this;

            var enabledDestinations = shelby.config.services.share;
            if (shelby.models.user.has('app_progress')) {
                enabledDestinations = [];
                var userAppProgress = shelby.models.user.get('app_progress');
                _(shelby.config.services.share).each(function(service) {
                    if (!_(userAppProgress.attributes).has('share_' + service + '_enabled') || userAppProgress.get('share_' + service + '_enabled')) {
                        enabledDestinations.push(service);
                    }
                });
            }

            this.$el.html(this.template({
                dashboardEntry: this._dashboardEntry,
                enabledDestinations: enabledDestinations,
                frame: this._frame,
                isAnonymous: shelby.models.user.isAnonymous(),
                messages: libs.shelbyGT.viewHelpers.frame.getMessages(this._frame),
                video: this._video,
                roll: this._roll,
                user: shelby.models.user,
                userLoggedIn: !shelby.models.user.isNotLoggedIn()
            }));

            this._checkAndRenderShortlink();

            this._shelbyAutocompleteView = new ShelbyAutocompleteView({
                el: this.$('#js-sharing-message')[0],
                includeSources: ['shelby', 'twitter', 'facebook'],
                multiTerm: true,
                multiTermMethod: 'paragraph',
                shelbySource: function() {
                    return _(self._frame.get('conversation').get('messages').pluck('nickname')).uniq();
                }
            });
            this.renderChild(this._shelbyAutocompleteView);
        },

        setRoll: function(roll) {
            this._roll = roll;
        },

        _toggleComment: function(e) {
            // if the click was on an anchor within the frame comment just let the normal
            // link handling occur without showing/hiding the rest of the comment
            if (!$(e.target).is('a')) {
                $(e.currentTarget).toggleClass('line-clamp--open');
            }
        },

        _doShare: function(e) {
            e.preventDefault();

            if (!this._validate()) {
                return;
            }
            if (this._roll) {
                this._rerollFrameAndShare(this._roll);
            } else {
                this._createRollRerollFrameAndShare();
            }
        },

        _validate: function() {
            validates = true;

            if (this.$("#js-sharing-message").val().length < 1) {
                shelby.alert({
                    message: "<p>Please enter a comment</p>"
                });
                this.$('#js-sharing-message').addClass('error');
                validates = false;
            }

            return validates;
        },

        _clearErrors: function() {
            // this.$('#new-roll-name').removeClass('error');
            this.$('#js-sharing-message').removeClass('error');
        },

        _rerollFrameAndShare: function(roll) {
            var self = this;
            var message = this.$("#js-sharing-message").val();
            var shareDests = [];
            _(shelby.config.services.share).each(function(service) {
                var isServiceChecked = this.$(".js-toggle-" + service + "-sharing").is(':checked');
                if (isServiceChecked) {
                    shareDests.push(service);
                }
                shelby.models.user.get('app_progress').set('share_' + service + '_enabled', isServiceChecked);
            });

            shelby.models.user.get('app_progress').saveMe();

            if (this._frame.canReRoll()) {
                // if this is a frame that already exists in the DB and can be rerolled, reroll it
                this._frame.reRoll(roll, message, function(newFrame) {
                    //rolling is done (don't need to wait for add message to complete)
                    self._rollingSuccess(roll, newFrame);
                    // Optional Sharing (happens in the background)
                    if (shareDests.length) {
                        self._frameRollingState.get('shareModel').save({
                            destination: shareDests,
                            text: message
                        }, {
                            url: newFrame.shareUrl(),
                            success: function() {
                                self._trackShare(shareDests);
                            }
                        });
                    } else {
                        self._trackShare();
                    }
                });
            } else {
                // otherwise add a new frame via URL
                this._addViaUrl(message, roll, shareDests);
            }
        },

        _toggleCheckboxButton: function(e) {
            var $this = $(e.currentTarget),
                network = $this.data('network');

            $this.parent()
                .toggleClass('button_gray', !$this.is(':checked'))
                .toggleClass('button_' + network + '-blue', $this.is(':checked'));
        },

        _rollingSuccess: function(roll, newFrame) {
            this.parent.done();

            var msg = {
                message: '<p>Video successfully shared!</p>',
                button_primer: {
                    title: 'Done'
                },
                button_secondary: {
                    title: 'Go to my Profile'
                }
            };

            shelby.alert(msg, function(returnVal) {
                var rollId = newFrame.get('roll_id');

                if (returnVal == libs.shelbyGT.notificationStateModel.ReturnValueButtonSecondary) {
                    shelby.router.navigate('roll/' + rollId, {
                        trigger: true,
                        replace: true
                    });
                }
            });
        },

        _buildTweetUrl: function(shortlink) {
            if (!shortlink) {
                var msg = {
                    message: '<p>Oops! There was an error generating the shortlink. Please refresh your browser and try again.</p>',
                    button_primary: {
                        title: 'Refresh'
                    },
                    button_secondary: {
                        title: 'Dismiss'
                    }
                };

                shelby.alert(msg, function(returnVal) {
                    if (returnVal == libs.shelbyGT.notificationStateModel.ReturnValueButtonPrimary) {
                        window.location.reload(true);
                    }
                });
            }

            var tweetText = encodeURIComponent(this._video.get('title')),
                tweetUrl = shortlink;

            var url = 'https://twitter.com/intent/tweet?related=shelby&via=shelby&url=' + tweetUrl + '&text=' + tweetText + '';

            return url;
        },

        _addViaUrl: function(message, roll, shareDests) {
            var self = this;
            var newFrame = new libs.shelbyGT.FrameModel();
            newFrame.save({
                url: this._frame.get('video').get('source_url'),
                text: message,
                source: 'webapp'
            }, {
                url: shelby.config.apiRoot + '/roll/' + roll.id + '/frames',
                success: function(newFrame) {
                    //rolling is done (don't need to wait for add message to complete)
                    self._rollingSuccess(roll, newFrame);
                    // Optional Sharing (happens in the background)
                    if (shareDests.length) {
                        self._frameRollingState.get('shareModel').save({
                            destination: shareDests,
                            text: message
                        }, {
                            url: newFrame.shareUrl(),
                            success: function() {
                                self._trackShare(shareDests);
                            }
                        });
                    } else {
                        self._trackShare();
                    }
                },
                error: function(a, b, c) {
                    if (b.status == 404) {
                        shelby.alert({
                            message: "<p>404 error</p>"
                        });
                    } else {
                        shelby.alert({
                            message: "<p>sorry, something went wrong.</p>"
                        });
                    }
                }
            });
        },


        _trackShare: function(destinations) {
            if (!destinations) {
                destinations = [];
            }

            shelby.trackEx({
                providers: ['ga', 'kmq'],
                gaCategory: this._frame.getFrameDescription(this._dashboardEntry),
                gaAction: 'shared',
                gaLabel: shelby.models.user.get('nickname'),
                gaValue: destinations.length,
                kmqProperties: {
                    'outbound destination': destinations.join(", "),
                }
            });
        },

        _shareToFacebook: function(e) {
            e.preventDefault();

            if ($(e.currentTarget).hasClass('disabled')) {
                return;
            }

            var
            shortlink = this.options.currentFrameShortlink,
                text = 'Shelby.tv',
                videoDescription = this._video.get('description'),
                videoTitle = this._video.get('title'),
                videoThumbnail = this._video.get('thumbnail_url');


            if (typeof FB != "undefined") {
                FB.ui({
                        caption: text,
                        description: videoDescription,
                        link: shortlink,
                        method: 'feed',
                        name: videoTitle,
                        picture: videoThumbnail
                    },
                    function(response) {
                        if (response && response.post_id) {
                            // TODO:we should record that this happened.
                        }
                    }
                );
            }
        },

        _checkAndRenderShortlink: function() {
            var twitterHref,
                shortlink = this.options.currentFrameShortlink;

            if (shortlink) {
                //this is called in this.render(), as well as change:shortlink on the frame
                //because the pvi share button and frame button can call it separately
                twitterHref = this._buildTweetUrl(shortlink);

                this.$el.find('.js-tweet-share').removeClass('disabled').attr('href', twitterHref);
                this.$el.find('.js-facebook-post').removeClass('disabled');
            } else if (this._frame._clientSideFrameType == "Search") {
                var _searchFrameUrl = libs.shelbyGT.viewHelpers.frame.permalink(this._frame);
                twitterHref = this._buildTweetUrl(_searchFrameUrl);
                // set tweet and fb intents to something else!
                this.$el.find('.js-tweet-share').removeClass('disabled').attr('href', twitterHref);
                this.$el.find('.js-facebook-post').removeClass('disabled');
            }
        }

    });

})();
