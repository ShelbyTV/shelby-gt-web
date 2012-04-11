/*
 * --Pure JS Spinner--
 * -------------------
 * usage:
 * var spinner = new SpinnerView({el:'#some-el', hidden:true, spinOpts:{radius:15}});
 * spinner.render();
 * spinner.show();
 * -- OR --
 * var spinner = new SpinnerView({spinOpts:{radius:15}});
 * $('#something').append(spinner.renderSilent());
 */

libs.shelbyGT.SpinnerView = Support.CompositeView.extend({

  options : {
    // pass a view prototype or string of html to the constructor to override this
    replacement: null, // contents to be inserted in the view when the spinner is hidden
    // these will be applied by default
    // you can override individual options by passing opts.spinOpts
    spinOpts : {
      lines: 13, // The number of lines to draw
      length: 7, // The length of each line
      width: 4, // The line thickness
      radius: 10, // The radius of the inner circle
      rotate: 0, // The rotation offset
      color: '#000', // #rgb or #rrggbb
      speed: 1, // Rounds per second
      trail: 60, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      className: 'spinner', // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top: 'auto', // Top position relative to parent in px
      left: 'auto' // Left position relative to parent in px
    }
  },

  _$replacementDiv : null,

  initialize : function(opts) {
    (opts && opts.spinOpts) && _.extend(this.options.spinOpts, opts.spinOpts);
    if (this.options.replacement) {
      // the existing contents of the view element are wrapped up in a div that
      // we can hide and show to swap with the spinner
      this._$replacementDiv = $('<div/>').html(this.$el.html());
      this.$el.html(this._$replacementDiv);
    }
  },

  _cleanup : function() {
    if (libs.shelbyGT.SpinnerView.spinner) {
      libs.shelbyGT.SpinnerView.spinner.stop();
    }
  },

  show : function(){
    if (this.options.replacement) {
      // if we have something to replace the spinner with, hide it
      this._$replacementDiv.hide();
    }
    if (libs.shelbyGT.SpinnerView.spinner) {
      libs.shelbyGT.SpinnerView.spinner.stop();
    }
    libs.shelbyGT.SpinnerView.spinner = new Spinner(this.options.spinOpts);
    libs.shelbyGT.SpinnerView.spinner.spin();
    this.$el.append(libs.shelbyGT.SpinnerView.spinner.el);
  },

  hide : function(){
    if (this.options.replacement) {
      // if we have something to replace the spinner with, show it
      this._$replacementDiv.show();
    }
    if (libs.shelbyGT.SpinnerView.spinner) {
      libs.shelbyGT.SpinnerView.spinner.stop();
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
