libs.shelbyGT.ShareView = Support.CompositeView.extend({

  // <your text>… http://shl.by/xyz1234
  shareBaseLength : 23,

  _components : {
    autoComplete : true,
    emailAddresses : true,
    messageCounter :  true,
    shareButtonCopy : "Send", //TODO: possibly obsolete
    spinner : true
  },

  events : {
    "click  .js-submit-share:not(.js-sharing)" : "_share",
    "change .js-share-textarea"                : "_onUpdateShareText",
    "keyup  .js-share-textarea"                : "_onUpdateShareText",
    "focus  .js-share-textarea"                : "_onFocusShareText",
    "focus  .js-share-email-addresses"         : "_onFocusAddresses",
  },

  template : function(obj){
    return SHELBYJST['share'](obj);
  },

  initialize : function(){
    this.model.bind("change:text", this._updateTextLengthCounter, this);
    // Supporting direct share via email only right now...
    this.model.set('destination', ['email','twitter','facebook']);
  },

  _cleanup : function(){
    this.model.unbind("change:text", this._updateTextLengthCounter, this);
  },

  render : function(){
    this.$el.html(this.template({shareModel:this.model, components:this._components}));
    if (this._components.emailAddresses) {
      var recipientsAutocompleteView = new libs.shelbyGT.EmailAddressAutocompleteView({
        el : this.$('.js-share-email-addresses')[0],
        includeSources : ['email'],
        multiTerm : true
      });
      this.renderChild(recipientsAutocompleteView);
    }
    if (this._components.spinner) {
      this.spinner = new libs.shelbyGT.SpinnerView({
        el: this.$('.js-submit-share')[0],
        replacement : true,
        size : 'small'
      });
      this.renderChild(this.spinner);
    }
    if (this._components.autoComplete) {
      var shelbyAutocompleteView = new libs.shelbyGT.ShelbyAutocompleteView({
        el: this.el,
        inputSelector : '.js-share-textarea',
        includeSources : ['shelby'],
        multiTerm : true,
        multiTermMethod : 'paragraph'
      });
      this.renderChild(shelbyAutocompleteView);
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
  },

  _onFocusShareText : function(event){
    // remove the error highlight from this text area on focus if there is one
    this.$('.js-share-textarea').removeClass('error');
  },

  _onFocusAddresses : function(event){
    this.$('.js-share-email-addresses').removeClass('error');
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
    if(this._components.messageCounter){
      var charsLeft = this._getCharsLeft(text);
      this.$('#js-share-comment-counter').text(charsLeft==140 ? '' : charsLeft);
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

  //override this in your subclass to later validation behavior
  shouldValidateEmail : function(){
    return true;
  },

  _validateShare : function(){
    if(this._components.emailAddresses && this.shouldValidateEmail()){
      var $emailAddressesInput = this.$('.js-share-email-addresses');
      //clean up email addresses
      var emailAddresses = $emailAddressesInput.val();
      $emailAddressesInput.val(_(emailAddresses.split(/[,;]/)).compact().join(', '));
      //test for validity
      var regex = new RegExp($emailAddressesInput.attr("pattern"))
      var emailValid = regex.test($emailAddressesInput.val());
      //mark invalid
      if (!emailValid) {
        $emailAddressesInput.addClass('error');
        shelby.alert({message: "<p>Please enter comma-seperated email addresses.</p>"});
        return false;
      }
    }

    if(this._components.networkToggles && this.model.get('destination').length == 0){
      shelby.alert({message: "<p>Please choose a network to share on.</p>"});
      return false;
    }

    return true;
  },

  _share : function(){
    var self = this;

    if(!this._validateShare()) {
      this.$('.js-share-textarea, .js-share-email-addresses').addClass('error');
      this.onValidationFail();
      return false;
    }
    if (this.options.frame) {
      libs.utils.rhombus.sadd('shares', this.options.frame.id);
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
    if (this._components.emailAddresses) {
      this.model.set('destination', _.union(this.model.get('destination'), ['email']));
      this.model.set('addresses', this.$('.js-share-email-addresses').val());
      this.model.set('destination', ['email']);
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
      // console.log('this.model',this.model);
      this.model.save(null, this._getSaveOpts(chainedUrls));
    } else {
      // console.log('else this.model',this.model);
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
