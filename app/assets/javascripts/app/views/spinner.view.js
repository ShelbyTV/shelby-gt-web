libs.shelbyGT.SpinnerView = Support.CompositeView.extend({
  
  options : {
    replacement: false,
    size : 'small'
  },

  sizeToAssetMap : {
    "small"   :  "/images/assets/loading-small.gif",
    "medium"  :  "/images/assets/loading-medium.gif",
    "large"   :  "/images/assets/loading-large.gif",
    "explore" :  "/images/assets/loading-explore.gif"
  },

  _replacement : null,

  _isSpinning : false,

  initialize : function() {
    if (this.options.replacement) {
      this._replacement = this.$el.html();
    }
    if (this.model) {
      if (this.model.get('show')) {
        this.show();
      }
      this.model.bind('change:show', this._onShowChange, this);
    }
  },

  _cleanup : function() {
    if (this.model) {
      this.model.unbind('change:show', this._onShowChange, this);
    }
  },

  setModel : function(spinnerStateModel) {
    if (this.model) {
      this.model.unbind('change:show', this._onShowChange, this);
      this.model = null;
    }
    if (spinnerStateModel) {
      this.model = spinnerStateModel;
      this.model.set('show', this._isSpinning);
      this.model.bind('change:show', this._onShowChange, this);
    }
  },

  _onShowChange : function (spinnerStateModel, show) {
    if (show) {
      this.show();
    } else {
      this.hide();
    }
  },

  show : function(){
    var spinnerHtml = '<img class="spinner" src="'+this.sizeToAssetMap[this.options.size]+'" />';
    if (this.options.replacement) {
      if (!this._isSpinning) {
        this._replacement = this.$el.html();
        this.$el.html(spinnerHtml);
      }
    } else {
      if (!this._isSpinning) {
        this.$('.spinner').remove();
        this.$el.append(spinnerHtml);
      }
    }
    this._isSpinning = true;
    if (this.model) {
      this.model.set({show:true},{silent:true});
    }
  },

  hide : function(){
    if (this._isSpinning) {
      this.$('.spinner').remove();
      if (this.options.replacement) {
        // if we have something to replace the spinner with, show it
        this.$el.html(this._replacement);
      }
    }
    this._isSpinning = false;
    if (this.model) {
      this.model.set({show:false},{silent:true});
    }
  }

});
