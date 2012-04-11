libs.shelbyGT.ShareView = Support.CompositeView.extend({

  shareBaseLength : 0,
  //Compulsory overrides - _share

  _components : {
    networkToggles : true,
    shareButton : true,
    spinner : true
  },

  events : {
    "click .js-submit-share" : "_share",
    "keyup .js-share-textarea" : "_onUpdateShareText",
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
        el: '.js-submit-share',
        hidden : true,
        replacement : true,
        spinOpts : {
          lines: 13,
          length: 0,
          width: 3,
          radius: 7,
          rotate: 0,
          color: '#000',
          speed: 1.4,
          trail: 62,
          shadow: false,
          hwaccel: true,
          zIndex: 2e9,
          top: 'auto',
          left: 'auto'
        }
      });
      this.renderChild(this.spinner);
    }
    if (this._components.networkToggles){
      this.twitterButton = this.$('.js-toggle-twitter-sharing');
      this.facebookButton = this.$('.js-toggle-facebook-sharing');
    }
  },

  _toggleSpinner : function(){
    this.spinner.toggle();
  },

  _showSpinner : function(){
    this.spinner.show();
  },

  _hideSpinner : function(){
    this.spinner.hide();
  },

  _clearTextArea : function(){
    this.$('.js-share-textarea').val('');
    this.model.set('text', this.$('.js-share-textarea').val());
  },

  _onUpdateShareText : function(event){
    this.model.set('text', this.$('.js-share-textarea').val());
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
    if(!this._validateShare()) return false;
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
        console.log('sharing failed - bug fix needed');
      }
    };
  },

  _handleShareSuccess : function(chainedUrls){
    if (chainedUrls.length) {
      this.model.save(null, this._getSaveOpts(chainedUrls));
    } else {
      this._clearTextArea(); //hmm this should be shared for all inheritors...
      this._components.spinner && this._hideSpinner();
      this.onShareSuccess();
    }
  },

  onShareSuccess : function(){
    // subclasses may optionally override to perform custom handling on share success
  },

  saveUrl : function(){
    // subclasses must override with either a function or static value
    // to generate a url to be used for sharing
    console.log('Sorry, your ShareView subclass must override saveUrl');
    // returns a single url as a string, or an array of urls to be saved to in sequence
    // if returning an array, each subsequent save will wait for success of the previous one
  }

});
