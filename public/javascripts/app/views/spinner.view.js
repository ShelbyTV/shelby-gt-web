libs.shelbyGT.SpinnerView = Support.CompositeView.extend({
  
  options : {
    replacement: false,
    size : 'small'
  },

  sizeToAssetMap : {
    "small"  :  "/images/assets/loading-small.gif",
    "medium" :  "/images/assets/loading-medium.gif",
    "large"  :  "/images/assets/loading-large.gif"
  },

  _replacement : null,

  _isSpinning : false,

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
  }

});
