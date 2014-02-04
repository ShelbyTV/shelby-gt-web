var FrameInteractions = Backbone.View.extend({
  options : {
    apiRoot         : '//api.shelby.tv/v1',
    sources         : { bookmarklet: 'bookmarket', shares: 'shares'},
    sharePanelClass : '.js-shares',
    sharePanelData  : {
      anonymous             : false,
      currentFrameShortlink : null,
      facebook_enabled      : false,
      facebook_checked      : false,
      frameId               : null,
      twitter_enabled       : false,
      twitter_checked       : false,
      twitter_intent        : null,
      shortlinkable         : null,
      suffix                : ''
    }
  },

  el: '.frame_interactions',

  sharePaneljst: function(data){
    return SHELBYJST['share-page-form'](data);
  },

  events: {
    'click .js-share-init'               : 'toggleSharePanel',
    'click .js-like'                     : 'doLike',
    'click .js-share-it'                 : 'submitShare',
    'change .js-toggle-twitter-sharing'  : 'toggleSocial',
    'change .js-toggle-facebook-sharing' : 'toggleSocial',
    'submit .js-share-submit'            : 'submitShare',
    'reset .js-share-submit'             : 'resetShare'
  },

  initialize : function(e){
    //get the JSON from the <script> and store a BB model in the view.
    var video = JSON.parse(this.$el.find('.js-video').html());
    this.options.video = new Video(video);


    this.render();
  },
  _cleanup: function(){

  },
  render : function(){
    //careful, extending two things here:
    var data = _(this.options.sharePanelData).extend(this._getUserAuthentications(),{
      username      : this.options.user.get('nickname'),
      shortlinkable : this.options.source == this.options.sources.shares
    });

    this.$el.find(this.options.sharePanelClass).html(this.sharePaneljst(data));
  },

  doLike : function(e){
    var self    = this,
        $button = $(e.currentTarget);

    //prevent extraneous api calls
    if($button.hasClass('visuallydisabled')) { return false; }

    e.preventDefault();

    $button.children('.icon-like').addClass('icon-like--red');
    $button.children('.button_label').text('Liked');

    $.ajax({
      type: 'GET',
      url: this.options.apiRoot + '/POST/roll/' + this.options.user.get('watch_later_roll_id') + '/frames',
      dataType: "jsonp",
      timeout: 10000,
      crossDomain: true,
      data: {
        provider_id   : this.options.video.get('provider_id'),
        provider_name : this.options.video.get('provider_name'),
        url           : this.options.video.composeKnownUrl()
      },
      xhrFields: {
        withCredentials : true
      },
      success: function () {},
      error: function () {}
    });

    $button.addClass('visuallydisabled');
  },
  toggleSharePanel: function(e){
    this.$el.find('.js-share-init').toggleClass('button_active');
    this.$el.find(this.options.sharePanelClass).toggleClass('hidden');
  },
  toggleSocial: function(e){
    e.preventDefault();

    var $this = $(e.currentTarget),
      network = $this.data('network');

    $this.parent()
      .toggleClass('button_gray', !$this.is(':checked'))
      .toggleClass('button_' + network + '-blue', $this.is(':checked'));
  },
  resetShare: function(e){
    this.toggleSharePanel();
  },
  submitShare: function(e){
    e.preventDefault();

    var self = this,
        $button = $(e.currentTarget),
        data = {
          source: this.options.source,
          text: this.$el.find('#frame_comment').val(),
          frame_id: this.$el.find('.js-share-init').data('frame_id')
        },
        destinations = [];

    if (this.options.source == this.options.sources.bookmarklet) {
      data.url = this.options.video.composeKnownUrl();
      delete data.frame_id;
    }

    if (this.$el.find('#share-on-facebook').is(':checked')) {
      destinations.push('facebook');
    }

    if (this.$el.find('#share-on-twitter').is(':checked')) {
      destinations.push('twitter');
    }

    $.ajax({
      type: 'GET',
      url: this.options.apiRoot + '/POST/roll/' + this.options.user.get('personal_roll_id') + '/frames',
      dataType: "jsonp",
      timeout: 10000,
      crossDomain: true,
      data: data,
      xhrFields: {
        withCredentials: true
      },
      success: function(response) {
        console.log("Share successful!");

        // $notification.removeClass('hidden');

        // setTimeout(function() {
        //   $notification.addClass('hidden');
        // }, 3000);

        self.toggleSharePanel();

        var new_frame_id = response.result.id,
            shareData = {
              destination: destinations,
              frame_id: new_frame_id,
              text: data.text
            };

        shelby.trackEx({
          providers: ['ga', 'kmq'],
          gaCategory: shelbyTrackingCategory,
          gaAction: 'shared',
          gaLabel: self.options.user.get('nickname'),
          gaValue: destinations.length,
          kmqProperties: {
            'outbound destination': destinations.join(", "),
          }
        });

        if (shareData.destination.length > 0) {
          $.ajax({
            type: 'GET',
            url: self.options.apiRoot + '/POST/frame/' + new_frame_id + '/share',
            dataType: "jsonp",
            timeout: 10000,
            crossDomain: true,
            data: shareData,
            xhrFields: {
              withCredentials: true
            },
            success: function(response) {

              console.log("Social Share successful!");
            },
            error: function() {
              console.log("Social Sharing failed.");
            }
          });
        }
      },
      error: function(e) {
        console.log("Share unsuccessful: ", e);
      }
    });
  },

  _getUserAuthentications : function(){
    var data = {},
        user_auth = this.options.user.get('authentications'),
        app_progress = this.options.user.get('app_progress');

    for (var network in user_auth) {
      service = user_auth[network];

      if (service.provider == 'twitter') {
        data.twitter_enabled = true;
        data.twitter_checked = app_progress.share_twitter_enabled;
      } else if (service.provider == 'facebook') {
        data.facebook_enabled = true;
        data.twitter_checked = app_progress.share_facebook_enabled;
      }
    }

    return data;
  }
});
