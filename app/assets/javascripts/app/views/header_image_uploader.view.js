libs.shelbyGT.HeaderImageUploaderView = Support.CompositeView.extend({

  className : 'guide-header-roll-header-uploader js-guide-header-roll-header-uploader',

  template : function(obj){
    return SHELBYJST['header-image-uploader'](obj);
  },

  initialize : function(){
    this.model.bind('change', this._onRollChange, this);
  },

  _cleanup : function(){
    this.model.unbind('change', this._onRollChange, this);
  },

  render : function(){
    this.$el.html(this.template());

    //set the upload progress, spinner elements used when uploading
    this.options.progressEl = this.$(".progress-overlay");
    this.options.spinnerEl = this.$(".spinner-overlay");

    this._initUploader();
  },

  _onRollChange : function(rollModel) {
    var _changedAttrs = _(rollModel.changedAttributes());
    if (_changedAttrs.has('header_image_file_name') || _changedAttrs.has('title') || _changedAttrs.has('frame_count')) {
      this.render();
    }
  },

  /*****************
   * Roll Header Image Uploading
   *
   * This was copied almost *exactly* from user_avatar_uploader.view.js
   * Changes are noted in comments
   * If we need to use this again elsewhere, it's time to DRY it up and abstract it.
   *****************/
  _initUploader: function(){
    var self = this;

    this.$el.fileupload({
      xhrFields: { withCredentials: true },
      dataType: 'json',
      type: 'put',

      // Roll model doesn't have url() defined, it's dynamic in sync()
      // So I added a static updateUrl() (which is different from User model)
      url: self.model.updateUrl(),

      done: function (e, data) {
        self._hideSpinner();
        self._hideProgressMessage();
        self._clearProgress();

        if(data.result.status == 200){
          // This is also different from User code, but a bit more generic and would probably work over there too.
          self.model.set(data.result.result);
          self.render();

          shelby.track( 'roll_header_image_upload_fail', { userName: shelby.models.user.get('nickname') });
        } else {
          shelby.alert({message: "<p>Sorry, that upload failed.</p>"});
          shelby.track( 'roll_header_image_upload_fail', { userName: shelby.models.user.get('nickname') });
        }
      },
      error: function(){
        self._hideSpinner();
        self._hideProgressMessage();
        self._clearProgress();
        shelby.alert({message: "<p>Sorry, that upload failed.</p>"});
        shelby.track( 'roll_header_image_upload_fail', { userName: shelby.models.user.get('nickname') });
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
