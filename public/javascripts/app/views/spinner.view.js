libs.shelbyGT.SpinnerView = Support.CompositeView.extend({ 
  
  options : { 
    replacement: false,
    size : 'small'
  },

  sizeToAssetMap : {
    "small" :  "/images/assets/loading-small.png",
    "large" :  "/images/assets/loading-large.gif"
  },

  _replacement : null,

  initialize : function() {
    if (this.options.replacement) {
      this._replacement = this.$el.html();
    }
  },

  show : function(){
    if (this.options.replacement) {
      this._replacement = this.$el.html();
    }
    this.$el.html('<img class="spinner" src="'+this.sizeToAssetMap[this.options.size]+'" />');
  },

  hide : function(){
    this.$('.spinner').remove();
    if (this.options.replacement) {
      // if we have something to replace the spinner with, show it
      this.$el.html(this._replacement);
    }
  },

  render : function(){
    if (this.options.hidden) {
      this.hide();
    } else {
      this.show();
    }
  }

});
