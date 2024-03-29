( function(){

  // shorten names of included library prototypes
  var ShareView = libs.shelbyGT.ShareView;
  var ShareActionState = libs.shelbyGT.ShareActionState;

  libs.shelbyGT.FrameRollingShareView = libs.shelbyGT.ShareView.extend({

    events : _.extend({}, ShareView.prototype.events, {
        "keyup .js-new-roll-name-input" : "_updateRollTitle",
        "focus .js-new-roll-name-input" : "_onFocusRollTitle",
        "keyup .js-new-roll-recipients" : "_updateRollRecipients",
        "focus .js-new-roll-recipients" : "_onFocusRollRecipients"
    }),

    id: 'js-share-frame',

    className : 'frame-share rolling-frame-trans',

    _components : {
      networkToggles : true,
      shareButton : true,
      spinner : true
    },

    initialize : function(){
      this.options.frameRollingState.bind('change:doShare', this._onDoShareChange, this);
      ShareView.prototype.initialize.call(this);
    },

    _cleanup : function(){
      this.options.frameRollingState.unbind('change:doShare', this._onDoShareChange, this);
      ShareView.prototype._cleanup.call(this);
    },

    saveUrl: function(){
      return [
        shelby.config.apiRoot + '/conversation/' + this.options.frame.get('conversation_id') + '/messages',
        shelby.config.apiRoot + '/frame/' + this.options.frame.id + '/share'
      ];
    },

    render : function(){
      this._components.networkToggles = this.options.roll.get('public');
      ShareView.prototype.render.call(this);
      if (!this.options.sharing) {
        this.$('.js-submit-share').text('Roll it');
      }
      if (this.options.roll.isNew()) {
        // when creating a new roll there are some additional options to be displayed
        this.$('.share-comment').before(SHELBYJST['frame-rolling-options']({roll:this.options.roll}));
      }
    },

    _share : function(){
      if (this.options.roll.isNew()) {
        return this._shareNewRoll();
      } else {
        return this._shareExistingRoll();
      }
    },

    _shareExistingRoll : function(){
      var self = this;
      if(!this._validateShare()) {
        this.$('.js-share-textarea').addClass('error');
        this.onValidationFail();
        return false;
      } else {
        this.$('.js-share-textarea').removeClass('error');
      }
      this._components.spinner && this._showSpinner();
      // reroll the frame, then share the new frame
      this.options.frame.reRoll(this.options.roll, null, function(newFrame){
        self.options.frame = newFrame;
        ShareView.prototype._share.call(self);
      });

      return false;
    },

    _shareNewRoll : function(){
      var self = this;
      var formValid = true;
      if(!this._validateShare()) {
        this.$('.js-share-textarea').addClass('error');
        formValid = false;
      }
      var title = this.options.roll.get('title');
      if(!(title && title.length)) {
        this.$('.js-new-roll-name-input').addClass('error');
        formValid = false;
      }
      if(!this.options.roll.get('public') && !this.model.get('addresses').length) {
        this.$('.js-new-roll-recipients').addClass('error');
        formValid = false;
      }
      if (!formValid) {
        this.onValidationFail();
        return false;
      } else {
        this.$('.js-share-textarea').removeClass('error');
        this.$('.js-new-roll-name-input').removeClass('error');
        this.$('.js-new-roll-recipients').removeClass('error');
      }
      this._components.spinner && this._showSpinner();
      // have to create the new roll and reroll the frame before we can share
      this.options.roll.save(null, {
        success : function(newRoll){
          shelby.models.rollFollowings.add(newRoll);
          self.options.frame.reRoll(newRoll, null, function(newFrame){
            self.options.frame = newFrame;
            // the backend will later assign a thumbnail to the new roll, but we won't see that
            // until the next roll followings refresh, so set it ourselves on the new roll model
            newRoll.set('thumbnail_url', self.options.frame.getVideoThumbnailUrl());
            ShareView.prototype._share.call(self);
          });
        }});

      return false;
    },

    onShareSuccess: function(){
      var self = this;
      this.$('.share-comment').append(SHELBYJST['shared-indicator']());
      setTimeout(function(){
        self.options.frameRollingState.set('doShare', ShareActionState.complete);
      }, 200);
    },

    onShareError : function(){
      this.options.frameRollingState.set('doShare', ShareActionState.failed);
    },

    onValidationFail : function(){
      this.options.frameRollingState.set('doShare', ShareActionState.failed);
    },

    _onDoShareChange: function(frameRollingStateModel, doShare){
      if (doShare == ShareActionState.share) {
        this._share();
      }
    },

    _updateRollTitle : function(e){
      this.options.roll.set('title',$(e.currentTarget).val());
    },

    _onFocusRollTitle : function(){
      // remove the error highlight from the roll title input on focus if there is one
      this.$('.js-new-roll-name-input').removeClass('error');
    },

    _updateRollRecipients : function(e){
      this.model.set('addresses',$(e.currentTarget).val());
    },

    _onFocusRollRecipients : function(){
      // remove the error highlight from the roll title input on focus if there is one
      this.$('.js-new-roll-recipients').removeClass('error');
    }

  });

} ) ();