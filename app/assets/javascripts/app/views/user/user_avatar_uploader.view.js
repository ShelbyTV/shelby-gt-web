/*
* Manages the async uploading of a user avatar, updating the user model on success.
*
* Works well in conjunction with UserAvatarPresenter.
*
* OPTIONS
*  spinnerEl: into which this view will render a spinner during upload
*  progressEl: will adjust it's width to represent percentage of upload complete
*
* (see libs.shelbyGT.UserPreferencesView for a working example)
*/

libs.shelbyGT.UserAvatarUploaderView = Support.CompositeView.extend({

  template : function(obj){
    return SHELBYJST['user/avatar-uploader'](obj);
  },


  initialize : function(){
    this.model = shelby.models.user;
  },

  _cleanup : function(){
  },

  render : function(){
    this.$el.html(this.template({ user: this.model }));

    this._initUploader();
  },

  /*****************
   * Image Uploading
   *
   * This was copied almost *exactly* for iso_roll_header.view.js (which allows uploading of header image)
   * If we need to use this again elsewhere, it's time to DRY it up and abstract it.
   *****************/
  _initUploader: function(){
    var self = this;

    this.$el.fileupload({
      xhrFields: { withCredentials: true },
      dataType: 'json',
      type: 'put',

      url: self.model.url(),

      done: function (e, data) {
        self._hideSpinner();
        self._hideProgressMessage();
        self._clearProgress();

        if(data.result.status == 200){
          //avatar_updated_at does come back with result, but this will work just as well
          self.model.set({avatar_updated_at:Date.now(), has_shelby_avatar:true});
          shelby.track( 'avatar_upload_success', { userName: shelby.models.user.get('nickname') });
        } else {
          shelby.alert({message: "<p>Sorry, that upload failed.</p>"});
          shelby.track( 'avatar_upload_fail', { userName: shelby.models.user.get('nickname') });
        }
      },
      error: function(){
        self._hideSpinner();
        self._hideProgressMessage();
        self._clearProgress();
        shelby.alert({message: "<p>Sorry, that upload failed.</p>"});
        shelby.track( 'avatar_upload_fail', { userName: shelby.models.user.get('nickname') });
      },
      change: function (e, data) {
        self._showSpinner();
        self._showProgressMessage();
        self._clearProgress();
      },
      progressall: function (e, data) {
        var progress = parseInt(data.loaded / data.total * 100, 10);
        self._updateProgress(progress);
      }
    });
  },

  _updateProgress: function(pct){
    if(this.options.progressEl){
      $(this.options.progressEl).css('width', pct+'%');
    }
  },

  _clearProgress: function(){
    if(this.options.progressEl){
      $(this.options.progressEl).css('width', '0');
    }
  },

  _showSpinner: function(){
    if( this.options.spinnerEl && !this._spinner ){
      this._spinner = new libs.shelbyGT.SpinnerView({
        el: this.options.spinnerEl,
        replacement : true,
        size : this.options.spinnerSize || 'large-light'
      });
      this.renderChild(this._spinner);
    }

    if(this._spinner) this._spinner.show();
  },

  _hideSpinner: function(){
    if(this._spinner) this._spinner.hide();
  },

  _showProgressMessage : function(){
    $(this.options.progressMessageEl).text('Uploading...');
  },

  _hideProgressMessage : function(){
    $(this.options.progressMessageEl).text('');
  }

});