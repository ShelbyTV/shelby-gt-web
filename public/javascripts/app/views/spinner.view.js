libs.shelbyGT.SpinnerView = Support.CompositeView.extend({
  
  options : {
    hidden: false,
    replacement: false,
    size : 'small'
  },

  sizeToAssetMap : {
    "small"  :  "/images/assets/loading-small.gif",
    "medium" :  "/images/assets/loading-medium.gif",
    "large"  :  "/images/assets/loading-large.gif"
  },

  _replacement : null,

  _isSpinning : true,

  initialize : function() {
    if (this.options.replacement) {
      this._replacement = this.$el.html();
    }
  },

  show : function(){
    if (!this._isSpinning) {
      if (this.options.replacement) {
        this._replacement = this.$el.html();
      }
      this.$el.html('<img class="spinner" src="'+this.sizeToAssetMap[this.options.size]+'" />');
    }
    this._isSpinning = true;
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
  },

  render : function(){
    if (this.options.hidden) {
      this.hide();
    } else {
      this.show();
    }
  }

});
