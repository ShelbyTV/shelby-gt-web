libs.shelbyGT.ShareView = Support.CompositeView.extend({

  shareBaseLength : 0,

  _components : {
    networkToggles : true,
    shareButton : true,
    spinner : true
  },

  events : {
    "click .js-submit-share:not(.js-sharing)" : "_share",
    "keyup .js-share-textarea" : "_onUpdateShareText",
    "focus .js-share-textarea" : "_onFocusShareText",
    "click .js-toggle-twitter-sharing" : "_toggleTwitterSharing",
    "click .js-toggle-facebook-sharing" : "_toggleFacebookSharing"
  },

  template : function(obj){
    return JST['share'](obj);
  },

  initialize : function(){
    this.model.bind("change:text", this._updateTextLengthCounter, this);
    this.model.bind("change:destination", this._updateDestinationButtons, this);
  },

  _cleanup : function(){
    this.model.unbind("change:text", this._updateTextLengthCounter, this);
    this.model.unbind("change:destination", this._updateDestinationButtons, this);
  },

  render : function(){
    this.$el.html(this.template({shareModel:this.model, components:this._components}));
    if (this._components.spinner) {
      this.spinner = new libs.shelbyGT.SpinnerView({
        el: this.$('.js-submit-share')[0],
        replacement : true,
        size : 'small'
      });
      this.renderChild(this.spinner);
    }
  },

  _showSpinner : function(){
    !shelby.models.user.get('anon') && this.spinner.show();
  },

  _hideSpinner : function(){
    this.spinner.hide();
  },

  _clearTextArea : function(){
    this.$('.js-share-textarea').val('');
    this.$('.js-share-textarea').removeAttr('placeholder');
    this.model.set('text', this.$('.js-share-textarea').val());
  },

  _onUpdateShareText : function(event){
    this.model.set('text', this.$('.js-share-textarea').val());
    (event.keyCode===13) && this._share();
  },

  _onFocusShareText : function(event){
    // remove the error highlight from this text area on focus if there is one
    this.$('.js-share-textarea').removeClass('error');
  },

  _updateDestinationButtons : function(shareModel){
    if (this._components.networkToggles) {
      var self = this;
      ['twitter', 'facebook'].forEach(function(network){
        var btn = this.$('.js-toggle-' + network + '-sharing');
        shareModel.networkEnabled(network) ? btn.addClass('active') : btn.removeClass('active');
      });
    }
  },

  _getCharsLeft : function(){
    return 140 - this.shareBaseLength - this.model.get('text').length;
  },

  _updateTextLengthCounter : function(shareModel, text){
    var charsLeft = this._getCharsLeft(text);
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
  },

  _share : function(){
    var self = this;
    if(!this._validateShare()) {
      this.$('.js-share-textarea').addClass('error');
      this.onValidationFail();
      return false;
    }
    this.$('.js-share-textarea').removeClass('error');
    if (this._components.shareButton) {
      this.$('.js-submit-share').addClass('js-sharing');
    }
    this._components.spinner && this._showSpinner();
    var urls = typeof(this.saveUrl) === 'function' ? this.saveUrl() : this.saveUrl;
    if (!$.isArray(urls)) {
      urls = [urls];
    }
    this.model.save(null, this._getSaveOpts(urls));
    return false;
  },

  _getSaveOpts : function(urls){
    var self = this;
    var nextUrl = urls.shift();
    return {
      url : nextUrl,
      success : function(){
        self._handleShareSuccess(urls);
      },
      error : function(){
        self._handleShareError();
      }
    };
  },

  _handleShareSuccess : function(chainedUrls){
    if (chainedUrls.length) {
      this.model.save(null, this._getSaveOpts(chainedUrls));
    } else {
      this._clearTextArea();
      this._components.spinner && this._hideSpinner();
      this.onShareSuccess();
    }
  },

  _handleShareError : function(){
    console.log('sharing failed - bug fix needed');
    this._components.spinner && this._hideSpinner();
    if (this._components.shareButton) {
      this.$('.js-submit-share').removeClass('js-sharing');
    }
    this.onShareError();
  },

  onShareSuccess : function(){
    // subclasses may optionally override to perform custom handling on share success, but
    // should always call the superclass's implementation as part of theirs if they have
    // a share button
    if (this._components.shareButton) {
      this.$('.js-submit-share').removeClass('js-sharing');
    }
  },

  onShareError : function(){
    // subclasses may optionally override to perform custom handling on share error
  },

  onValidationFail : function(){
    // subclasses may optionally override to perform custom handling on share validation failure
  },

  saveUrl : function(){
    // subclasses must override with either a function or static value
    // to generate a url to be used for sharing
    console.log('Sorry, your ShareView subclass must override saveUrl');
    // returns a single url as a string, or an array of urls to be saved to in sequence
    // if returning an array, each subsequent save will wait for success of the previous one
  }

});
