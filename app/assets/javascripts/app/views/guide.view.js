libs.shelbyGT.GuideView = Support.CompositeView.extend({

  // initial height is set in _guide-overlay-view.scss #guide-header-roll-header-image
  // not currently using scroll-adjusted header image size, so MAX==MIN
  HEADER_IMAGE_MAX_HEIGHT : 50,
  HEADER_IMAGE_MIN_HEIGHT : 50,

  el: '.js-main-layout .js-guide',

  template : function(obj){
      return SHELBYJST['guide'](obj);
  },

  initialize : function(){
    this.model.bind("change:displayState", this._onChangeDisplayState, this);
  },

  _cleanup : function(){
    this.model.unbind("change:displayState", this._onChangeDisplayState, this);
  },

  render : function(){
    var self = this;

    this.$el.html(this.template());

    this.renderChild(new libs.shelbyGT.ItemHeaderView({model:this.model}));
    this.renderChild(new libs.shelbyGT.RollActionMenuView({
      model : shelby.models.guide
    }));
    //TODO: this is like not being used right now but probably will be.
    // this.renderChild(new libs.shelbyGT.addVideoView({model:this.model}));
    this.renderChild(new libs.shelbyGT.GuideContentView({
      model : this.model,
      playlistManager : shelby.models.playlistManager
    }));

    // enable iso-roll dynamically adjusting header image
    if( this.model.get('displayIsolatedRoll') ){
      $("#js-guide-body").on('scroll', function(e){ self._userDidScrollGuide(e); });
    }
  },

  _userDidScrollGuide : function(e){
    //we want to cache this height for optimization reasons, but we can also use this to determine if this should run or not
    var rollHeaderImageHeight = $("#guide-header-roll-header-image").height();
    if( rollHeaderImageHeight ){

      var guideBodyScrollTop = $("#js-guide-body").scrollTop();

      // Allow the big roll header image to shrink as the user srolls up in the guide
      if( rollHeaderImageHeight > this.HEADER_IMAGE_MIN_HEIGHT || rollHeaderImageHeight < this.HEADER_IMAGE_MAX_HEIGHT ){

        //adjust the image within js-guide-header
        var newHeight = this.HEADER_IMAGE_MAX_HEIGHT - guideBodyScrollTop;
        newHeight = Math.max(Math.min(this.HEADER_IMAGE_MAX_HEIGHT, newHeight), this.HEADER_IMAGE_MIN_HEIGHT);
        $("#guide-header-roll-header-image").css({'height': newHeight});

        //adjust the content within the js-guide-body to move inversely so it "sticks" while the header size is changing
        var bodyPadding = Math.min(this.HEADER_IMAGE_MAX_HEIGHT - this.HEADER_IMAGE_MIN_HEIGHT, guideBodyScrollTop);
        $("#js-guide-body").css({'padding-top': bodyPadding });

        //the js-guide-header now has a new height; make sure the js-guide-body moves in lock step
        shelby.models.guide.trigger('reposition');
      }
    }
  },

  _onChangeDisplayState : function(guideModel, displayState) {
    this.$el.toggleClass('hide-guide--user-profile', displayState == libs.shelbyGT.DisplayState.dotTv);
  }

});