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

libs.shelbyGT.SpinnerView = Backbone.View.extend({

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
  },

  className : 'spinner',

  initialize : function(opts) {
    opts.spinOpts && _.extend(this.spinOpts, opts.spinOpts);
    this.spinner = new Spinner(this.spinOpts).spin();
  },

  show : function(){
    $(this.spinner.el).removeClass('hidden');
  },

  hide : function(){
    $(this.spinner.el).addClass('hidden');
  },

  renderSilent : function(){
    this.render(true);
  },

  render : function(silent){
    $(this.spinner.el).addClass(this.hidden ? 'hidden' : '');
    return silent ? this.spinner.el : this.$el.append(this.spinner.el);
  }

});
