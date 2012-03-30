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

  render : function(){
    this.$el.html(this.template({shareModel:this.model}));
    this.twitterButton = this.$('#js-toggle-twitter-sharing');
    this.facebookButton = this.$('#js-toggle-facebook-sharing');
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

  _updateCommentLengthCounter : function(shareModel, comment){
    var charsLeft = 140 - comment.length;
    this.$('#js-share-comment-counter').text(charsLeft==140 ? '' : charsLeft); 
  },

  _shareCurrentRoll : function(){
    if(!this._validateShare()) return false;
    console.log('sharing', this.model.get('comment'), 'to', this.model.get('destination'));
    /*this.model.save(null, {success:function(){
      console.log('success', arguments);
    }, error: function(){
      console.log('error', arguments);
    }});*/
    // now save the model
    return false;
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

  _validateShare : function(share){
    // check this.model.get('comment')
    return true;
  }

});
