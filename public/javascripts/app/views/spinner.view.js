libs.shelbyGT.SpinnerView = Support.CompositeView.extend({

  options : {
    replacement: false
  },

  _replacement : null,

  initialize : function(opts) {
    if (this.options.replacement) {
      this._replacement = this.$el.html();
    }
  },

  show : function(){
    if (this.options.replacement) {
      this._replacement = this.$el.html();
    }
    this.$el.html('<div class="spinner">SPINNER</div>');
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
