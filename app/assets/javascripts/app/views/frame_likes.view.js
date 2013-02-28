libs.shelbyGT.FrameLikesView = Support.CompositeView.extend({

  _frame : null,

  options : {
    numAvatarsDisplayed : 9, // the number of liker avatars to display
    selfBindAndUpdate : false // whether the view will bind to its model and dynamically update itself
                              // default is false, in which case updates must be handled by the parent
  },

  template : function(obj){
    return SHELBYJST['frame-likes'](obj);
  },

  initialize : function() {
    if (this.options.selfBindAndUpdate) {
      this._frame = this.model.getFirstFrame();
      this._frame.bind('change:upvoters change:like_count', this.render, this);
    }
  },

  _cleanup : function() {
    if (this.options.selfBindAndUpdate) {
      this._frame.unbind('change:upvoters change:like_count', this.render, this);
    }
  },

  render : function(){
    //calculate liker info
    var likeInfo = this.model.getCombinedLikeInfo();
    var likersCollection = new libs.shelbyGT.UserCollection();
    var likersToDisplay = likeInfo.likers.models.slice(0, this.options.numAvatarsDisplayed);
    if (likersToDisplay.length) {
      likersCollection.add(likersToDisplay);
    }
    var remainingLikes = likeInfo.totalLikes - likersToDisplay.length;

    this.$el.html(this.template({
      likers : likersToDisplay,
      remainingLikes : remainingLikes,
      totalLikes : likeInfo.totalLikes
    }));

    this.$el.toggleClass('frame-likes--hide', likeInfo.totalLikes == 0);

    if (likersToDisplay.length) {
      // render the likers' avatars, now if they've already arrived, or via event handling
      // later if the ajax hasn't returned yet
      this.renderChild(new libs.shelbyGT.ListView({
        collection : likersCollection,
        doStaticRender : true,
        el : this.$('.js-liker-avatars-list'),
        listItemView : 'LikerAvatarItemView'
      }));
    }

  }

});