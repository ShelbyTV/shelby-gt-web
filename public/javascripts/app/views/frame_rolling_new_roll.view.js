libs.shelbyGT.FrameRollingNewRollView = libs.shelbyGT.FrameShareView.extend({

  events : _.extend({}, libs.shelbyGT.FrameShareView.prototype.events, {
      "keyup .js-new-roll-name-input" : "_updateRollTitle",
      "focus .js-new-roll-name-input" : "_onFocusRollTitle"
  }),

  saveUrl: function(){
    return [
      shelby.config.apiRoot + '/conversation/' + this.options.frame.get('conversation_id') + '/messages',
      shelby.config.apiRoot + '/frame/' + this.options.frame.id + '/share'
    ];
  },

  render : function(){
    libs.shelbyGT.FrameShareView.prototype.render.call(this);
    this.$('.share-comment').before(JST['frame-rolling-options']({roll:this.options.roll}));
  },

  _share : function(){
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
    if (!formValid) {
      this.onValidationFail();
      return false;
    } else {
      this.$('.js-share-textarea').removeClass('error');
      this.$('.js-new-roll-name-input').removeClass('error');
    }
    this._components.spinner && this._showSpinner();
    // have to create the roll and reroll the frame before we can share
    this.options.roll.save(null, {
      success : function(newRoll){
        self.options.frame.reRoll(newRoll, function(newFrame){
          self.options.frame = newFrame;
          libs.shelbyGT.FrameShareView.prototype._share.call(self);
        });
      }});

    return false;
  },

  _updateRollTitle : function(e){
    this.options.roll.set('title',$(e.currentTarget).val());
  },

  _onFocusRollTitle : function(){
    // remove the error highlight from the roll title input on focus if there is one
    this.$('.js-new-roll-name-input').removeClass('error');
  }

});
