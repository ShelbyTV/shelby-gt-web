(function(){

  libs.shelbyGT.ScrollingGuideView = Support.CompositeView.extend({

    events : {
      "click .js-about-nav-item" : "_scrollToElement"
    },

    render : function(){
      this.$el.html(this.template({user:this.model}));
      this._scrollToTop();
    },

    _scrollGuideWrapperTo : function(target, opts){
      $('#js-guide-wrapper').scrollTo(target, opts);
    },

    _scrollToTop : function(){
      //$('#js-guide-wrapper').scrollTo(0);
      this._scrollGuideWrapperTo(0);
    },

    _scrollToElement : function(e){
      e.preventDefault();
      var options = {
        duration : 200, 
        axis : 'y', 
        offset : { top : -10 }
      };
      this._scrollGuideWrapperTo($(e.currentTarget.hash.replace('#','.')), options);
    }

  });
})();
