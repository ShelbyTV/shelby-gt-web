$(function(){
  Shelby.FrameInteraction = Backbone.View.extend({
    options : {
      apiRoot         : '//api.shelby.tv/v1',
      likerJSONClass  : '.js-likes-array',
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
      },
      doLikeAjaxConfig : function(){
        //logged out
        if(Shelby.User.get('nickname') == Shelby.libs.User.anonymous.nickname) {
          return {
            url: Shelby.apiRoot + '/PUT/frame/' + this.media.get('id') + '/like',
            data: {
              frame_id: this.media.get('id')
            }
          };
        }
        else {
          //logged inkey: "value",
          //share pages & mobile web
          if(this.source == Shelby.libs.sources.shares){
           return {
            // this.media == frame, video is nested: frame.video
              url: Shelby.apiRoot + '/POST/roll/' + Shelby.User.get('watch_later_roll_id') + '/frames',
              data: {
                provider_id   : this.media.get('video').provider_id,
                provider_name : this.media.get('video').provider_name,
                url           : this.media.composeKnownUrl()
              }
            };
          }

          //logged in:
          //bookmarklet
          else {
            return {
              // this.media == video
              url: Shelby.apiRoot + '/POST/roll/' + Shelby.User.get('watch_later_roll_id') + '/frames',
              data: {
                provider_id   : this.media.get('provider_id'),
                provider_name : this.media.get('provider_name'),
                url           : this.media.composeKnownUrl()
              }
            };
          }
        }
      },
      doShareAjaxConfig : function(){
        // Shares & Mobile pages handle frame_ids
        if(this.source == Shelby.libs.sources.shares){
          return {
            source   : this.source,
            text     : null, //needs to spec'd in the function
            frame_id : this.media.get('id')
          };
        } else {
        // Bookmarklet handles videos that haven't been turned into Frames yet
          return {
            source : this.source,
            text   : null, //needs to be spec'd in the function
            url    : this.media.composeKnownUrl()
          };
        }
      }
    },

    el: '.js-frame',

    sharePaneljst: function(data){
      return SHELBYJST['share-page-form'](data);
    },

    // this Liker list container only exists if there's an existing Liker.
    // user this JST to inject the container if User is the first to Like.
    likerListjst: function(){
      // <div><ul>…</ul></div>
      return $('#js-frame-like').html();
    },

    // pre-filled List-item with the User avatar and meta data.
    // append this to existing frames
    // OR
    // append the likerListjst above, and inject this List-item
    likerItemjst: function(){
      // <li>…</li>
      return $('#js-user-like').html();
    },


    events: {
      'click .js-cancel'                   : 'toggleSharePanel',
      'click .js-share-init'               : 'toggleSharePanel',
      'click .js-like'                     : 'doLike',
      'click .js-share-it'                 : 'submitShare',
      'click .js-tweet-intent'             : 'tweetIntent',
      'click .js-facebook-msg'             : 'facebookMsg',
      'change .js-toggle-twitter-sharing'  : 'toggleSocial',
      'change .js-toggle-facebook-sharing' : 'toggleSocial',
      'submit .js-share-submit'            : 'submitShare',
      'reset .js-share-submit'             : 'resetShare'
    },

    initialize : function(e){
      this.options.media = this._initMediaModel();
      this.render();
    },
    _cleanup: function(){

    },
    render : function(){
      //careful, extending two things here:
      var data = _(this.options.sharePanelData).extend(this._getUserAuthentications(),{
        anonymous     : this.options.user.is_anonymous(),
        username      : this.options.user.get('nickname'),
        shortlinkable : this.options.source == Shelby.libs.sources.shares
      });

      this.$el.find(this.options.sharePanelClass).html(this.sharePaneljst(data));

      // this._fetchShortlink();

      // var likerArray = JSON.parse(this.$el.find('.js-likes-array').html());

      this._processLikers();
    },

    _initMediaModel : function(){
      //get the JSON from the <script> and store a BB model in the view.
      var selector,media;

      if(this.options.source == Shelby.libs.sources.shares) {
        selector = '.js-frame-json';
        model    = 'FrameModel';
      } else {
        selector = '.js-video';
        model    = 'VideoModel';
      }

        media = JSON.parse(this.$el.find(selector).html());
        return new Shelby[model](media);
    },

    _fetchShortlink : function(e){
      var $el      = this.$el,
          self     = this,
          frame_id = this.options.media.get('id');

      if(this.options.sharePanelData.shortlinkable !== false){
        $.ajax({
          type: 'GET',
          url: Shelby.apiRoot + '/frame/' + frame_id + '/short_link',
          dataType: "jsonp",
          timeout: 10000,
          crossDomain: true,
          xhrFields: {
            withCredentials: true
          },
          success: function(response) {
            self.options.sharePanelData.currentFrameShortlink = response.result.short_link;

            self._shortlinkSuccess(response.result.short_link);
          },
          error: function() {
            self.options.sharePanelData.currentFrameShortlink = null;
            self.$el.find('#shortlink').val('Error…');
          }
        });
      } else {
        console.log('Video not shortlinkable!');
      }
    },

    _shortlinkSuccess: function(shortlink){
      this.$el.find('.js-tweet-intent, .js-facebook-msg, #shortlink').removeAttr('disabled');
      this.$el.find('#shortlink').val(shortlink);
    },

    doLike : function(e){
      var self    = this,
          $button = $(e.currentTarget),
          _ajax   = this.options.doLikeAjaxConfig();

      //prevent extraneous api calls
      if($button.hasClass('visuallydisabled')) { return false; }

      e.preventDefault();

      $button.children('.icon-like').addClass('icon-like--red');
      $button.children('.button_label').text('Liked');

      $.ajax({
        type: 'GET',
        url: _ajax.url,
        dataType: "jsonp",
        timeout: 10000,
        crossDomain: true,
        data: _ajax.data,
        xhrFields: {
          withCredentials : true
        },
        success: function () {
          var $likesContainer = self.$el.find('.js-frame-likes');

          if($likesContainer.length) {
            $likesContainer.find('.js-liker-avatars-list').append(self.likerItemjst());
          } else {
            self.$el.append(self.likerListjst());
            self.$el.find('.js-liker-avatars-list').append(self.likerItemjst());
          }
        },
        error: function () {}
      });

      $button.addClass('visuallydisabled');
    },

    toggleSharePanel: function(e){
      this.$el.find('.js-share-init').toggleClass('button_active');
      this.$el.find(this.options.sharePanelClass).toggleClass('hidden');

      if(this.options.sharePanelData.currentFrameShortlink === null && this.options.sharePanelData.shortlinkable !== false){
        this._fetchShortlink();
      } else if(this.options.sharePanelData.currentFrameShortlink !== null) {
        this._shortlinkSuccess(this.options.sharePanelData.currentFrameShortlink);
      }
    },
    toggleSocial: function(e){
      e.preventDefault();

      var $button = $(e.currentTarget),
          network = $button.data('network');

      $button.parent()
        .toggleClass('button_gray', !$button.is(':checked'))
        .toggleClass('button_' + network + '-blue', $button.is(':checked'));
    },
    resetShare: function(e){
      this.toggleSharePanel();
    },
    submitShare: function(e){
      e.preventDefault();

      var self         = this,
          $button      = $(e.currentTarget),
          _ajax        = this.options.doShareAjaxConfig();

          _ajax.text = this.$el.find('#frame_comment').val();

      this.doShare(_ajax);

    },

    doShare: function(data){
      var self = this;

      $.ajax({
        type: 'GET',
        url: Shelby.apiRoot + '/POST/roll/' + this.options.user.get('personal_roll_id') + '/frames',
        dataType: "jsonp",
        timeout: 10000,
        crossDomain: true,
        data: data,
        xhrFields: {
          withCredentials: true
        },
        success: function(response) {
          console.log("Share successful!");

          var newFrame = new Shelby.FrameModel(response.result);

          self.toggleSharePanel();
          self.doSocialShare(newFrame,data);
        },
        error: function(e) {
          console.log("Share unsuccessful: ", e);
        }
      });

    },

    doSocialShare: function(frameModel,data){
      var self         = this,
          destinations = [],
          new_frame_id = frameModel.get('id'),
          shareData    = {
            destination : destinations,
            frame_id    : new_frame_id,
            text        : data.text
          };

      if (this.$el.find('#share-on-facebook').is(':checked')) {
        destinations.push('facebook');
      }

      if (this.$el.find('#share-on-twitter').is(':checked')) {
        destinations.push('twitter');
      }

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
    },

//logged out social media stuff-------------------------------------------------
    tweetIntent: function(e){
      e.preventDefault();

      var $this = $(this),
          url   = 'https://twitter.com/intent/tweet?related=shelby&via=shelby&url='
                    + this.options.sharePanelData.currentFrameShortlink + '&text='
                    + encodeURIComponent( this.options.media.get('video').title );

      window.open(url,'twitterShare','');
    },

    facebookMsg: function(e){
      e.preventDefault();
      var video = this.options.media.get('video');
      FB.ui(
        {
          caption     : 'Shelby.tv',
          description : video['description'],
          display     : 'popup',
          link        : video['short_link'],
          method      : 'feed',
          name        : video['video_title'],
          picture     : video['thumbnail_url'],
        },
        function(response) {
          if (response && response.post_id) {
            shelby.trackEx({
              providers: ['ga'],
              gaCategory: loc,
              gaAction: 'Anonymous Facebook Share',
              gaLabel: Shelby.User.get('nickname')
            });
          }
        }
      );
    },


//liker dynamicism  ------------------------------------------------------------
    _processLikers: function(){
      var $likers = this.$el.find(this.options.likerJSONClass);

      if ($likers && $likers.length) {
        $likers = JSON.parse($likers.html());
        this._fetchLikers($likers);
      }
    },

    _fetchLikers: function(likers){
        var self = this,
            data = {
              ids: likers.join(',')
            };

        $.ajax({
          type: 'GET',
          url: Shelby.apiRoot + '/user',
          dataType: "jsonp",
          timeout: 10000,
          crossDomain: true,
          data: data,
          xhrFields: {
            withCredentials: true
          },
          success: function(response) {
            var $container = self.$el.find('.js-liker-avatars-list').empty(),
                likerArray = response.result;

            self._appendLikers(likerArray,$container);
          },
          error: function(e) {
            console.log("Oops!", e.statusText);
          }
        });
      },

      _appendLikers: function(likerArray, $el){
        for (var i = 0; i < likerArray.length; i++) {

          var user   = likerArray[i],
              avatar = Shelby.libs.User.avatarUrl(user);

          $el.append(SHELBYJST['liker-item']({
            avatar          : avatar,
            liker           : user,
            appropriatePath : appropriateSubdirectory
          }));
        }
      }
  });

});
