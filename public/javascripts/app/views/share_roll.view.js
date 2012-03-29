libs.shelbyGT.ShareRollView = Support.CompositeView.extend({

  events : {
    "click #js-submit-roll-share" : "_shareCurrentRoll",
    "keyup #js-share-roll-textarea" : "_onUpdateShareComment",
    "click #js-toggle-twitter-sharing" : "_toggleTwitterSharing",
    "click #js-toggle-facebook-sharing" : "_toggleFacebookSharing"
  },

  el : '#js-share-roll',

  textarea : null,

  template : function(obj){
    return JST['share-roll'](obj);
  },

  initialize : function(){
    this.model.bind("change:comment", this._updateCommentLengthCounter, this);
    this.model.bind("change:destination", this._updateDestinationButtons, this);
    this.render();
  },

  render : function(){
    this.$el.html(this.template());
    this.textarea = this.$('#js-share-roll-textarea');
  },

  _onUpdateShareComment : function(event){
    this.model.set('comment', this.textarea.val()); 
    (event.keyCode===13) && this._shareCurrentRoll();
  },

  _updateCommentLengthCounter : function(shareModel, comment){
    var charsLeft = 140 - comment.length;
    console.log(charsLeft, 'chars left');
  },

  _getShareAjaxOpts : function(share){
    return {
      type : 'GET',
      url : '/v1/roll/'+shelby.models.guide.get('contentPaneModel').id+'/share',
      data : this.model.toJSON() 
    };
  },

  _shareCurrentRoll : function(){
    var share = this.$('#js-share-roll-textarea').val();
    if(!this._validateShare(share)) return false;
    //$.ajax();
    console.log('sharing', share);
    console.log(this._getShareAjaxOpts());
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
    return true;
  }

});
