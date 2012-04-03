libs.shelbyGT.ShareRollView = Support.CompositeView.extend({

  events : {
    "click #js-submit-roll-share" : "_shareCurrentRoll",
    "keyup #js-share-roll-textarea" : "_onUpdateShareComment",
    "click #js-toggle-twitter-sharing" : "_toggleTwitterSharing",
    "click #js-toggle-facebook-sharing" : "_toggleFacebookSharing"
  },

  el : '#js-share-roll',

  template : function(obj){
    return JST['share-roll'](obj);
  },

  initialize : function(){
    this.model.bind("change:comment", this._updateCommentLengthCounter, this);
    this.model.bind("change:destination", this._updateDestinationButtons, this);
  },

  _cleanup : function(){
    this.model.unbind("change:comment", this._updateCommentLengthCounter, this);
    this.model.unbind("change:destination", this._updateDestinationButtons, this);
  },

  render : function(){
    this.$el.html(this.template({shareModel:this.model}));
    this.spinner = this._initSpinner();
    this.twitterButton = this.$('#js-toggle-twitter-sharing');
    this.facebookButton = this.$('#js-toggle-facebook-sharing');
  },

  _initSpinner : function(){
    return new libs.shelbyGT.SpinnerView({ spinOpts: { lines: 11, length: 0, width: 3, radius: 7, rotate: 0, color: '#000', speed: 1.4, trail: 62, shadow: false, hwaccel: true, className: 'spinner', zIndex: 2e9, top: 'auto', left: 'auto' } });
  },

  _onUpdateShareComment : function(event){
    this.model.set('comment', this.$('#js-share-roll-textarea').val());
    (event.keyCode===13) && this._shareCurrentRoll();
  },

  _updateDestinationButtons : function(shareModel){
    var self = this;
    ['twitter', 'facebook'].forEach(function(network){
      var btn = self[network+'Button'];
      shareModel.networkEnabled(network) ? btn.addClass('active') : btn.removeClass('active');
    });
  },

  _getCharsLeft : function(){
    return 140 - this.model.get('comment').length;
  },

  _updateCommentLengthCounter : function(shareModel, comment){
    var charsLeft = this._getCharsLeft(comment);
    this.$('#js-share-comment-counter').text(charsLeft==140 ? '' : charsLeft);
  },

  _shareCurrentRoll : function(){
    var self = this;
    if(!this._validateShare()) return false;
    console.log('sharing', this.model.get('comment'), 'to', this.model.get('destination'));
    this._toggleSpinner();
    setTimeout(function(){
      self._onShareSuccess();
    }, 400);
    // now save the model
    /*this.model.save(null, {success:function(){
      console.log('success', arguments);
    }, error: function(){
      console.log('error', arguments);
    }});*/
    return false;
  },

  _onShareSuccess : function(){
    this._toggleSpinner();
    this.$el.toggle();
  },

  _toggleSpinner : function(){
    if (this.$('.spinner').length){
      console.log('resetting');
      this.$('#js-submit-roll-share').html('Share it');
    } else {
      console.log('spinning');
      this.$('#js-submit-roll-share').html(this.spinner.renderSilent());
    }
  },

  _toggleSharingByNetwork : function(network){
    var setOperation = this.model.get('destination').indexOf(network)===-1 ? _.union : _.difference;
    this.model.set('destination', setOperation(this.model.get('destination'), [network]));
  },

  _toggleTwitterSharing : function(){
    this._toggleSharingByNetwork('twitter');
  },

  _toggleFacebookSharing : function(){
    this._toggleSharingByNetwork('facebook');
  },

  _validateShare : function(){
    return (this._getCharsLeft() > -1);
  }

});
