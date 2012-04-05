libs.shelbyGT.ShareView = Support.CompositeView.extend({

  shareBaseLength : 0,

  events : {
    "click #js-submit-roll-share" : "_share",
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
    this.$el.html(this.template({shareModel:this.model, components:this._components}));
    if (this._components.spinner)  this.spinner = this._initSpinner();
    if (this._components.networkToggles){
      this.twitterButton = this.$('#js-toggle-twitter-sharing');
      this.facebookButton = this.$('#js-toggle-facebook-sharing');
    }
  },

  _clearTextArea : function(){
    this.$('#js-share-roll-textarea').val('');
    this.model.set('comment', this.$('#js-share-roll-textarea').val());
  },

  _onUpdateShareComment : function(event){
    this.model.set('comment', this.$('#js-share-roll-textarea').val());
    (event.keyCode===13) && this._share();
  },

  _updateDestinationButtons : function(shareModel){
    var self = this;
    ['twitter', 'facebook'].forEach(function(network){
      var btn = self[network+'Button'];
      shareModel.networkEnabled(network) ? btn.addClass('active') : btn.removeClass('active');
    });
  },

  _getCharsLeft : function(){
    return 140 - this.shareBaseLength - this.model.get('comment').length;
  },

  _updateCommentLengthCounter : function(shareModel, comment){
    var charsLeft = this._getCharsLeft(comment);
    this.$('#js-share-comment-counter').text(charsLeft==140 ? '' : charsLeft);
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
    return ((this._getCharsLeft() - this.shareBaseLength) < 140);
  }

});
