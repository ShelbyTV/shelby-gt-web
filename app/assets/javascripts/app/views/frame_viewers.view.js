libs.shelbyGT.FrameViewersView = Support.CompositeView.extend({

  _frame : null,

  options : {
    numAvatarsDisplayed : 9, // the number of roller avatars to display
    selfBindAndUpdate : false // whether the view will bind to its model and dynamically update itself
                              // default is false, in which case updates must be handled by the parent
  },

  template : function(obj){
    return SHELBYJST['frame-actions-counts'](obj);
  },

  initialize : function() {
    if (this.options.selfBindAndUpdate) {
      this._frame = this.model.getFirstFrame();
      // TODO: bind to something that will re-render when the frame gets rolled to this same channel
    }
  },

  _cleanup : function() {
    if (this.options.selfBindAndUpdate) {
      // TODO: unbind from something that will re-render when the frame gets rolled to this same channel
    }
  },

  render : function(){
    //calculate viewer info
    var actorsCollection = new libs.shelbyGT.UserCollection(),
    actorsToDisplay = [], 
    remainingActors = 0;
    
    if (this.model.primaryDashboardEntryIsPrioritized()){
      var viewerInfo = this.model.getFriendViewerAndCompleteViewerInfo(false);
      actorsToDisplay = viewerInfo.viewers.models.slice(0, this.options.numAvatarsDisplayed);
      if (actorsToDisplay.length) {
        actorsCollection.add(actorsToDisplay);
      }
      remainingActors = viewerInfo.totalViewers - actorsToDisplay.length;
    } else {
      //nothing, only showing watchers on prioritized dashboard entries
    }

    this.$el.html(this.template({
      likers : actorsToDisplay,
      remainingLikes : remainingActors
    }));

    this.$el.toggleClass('frame-likes--hide', actorsToDisplay.length == 0);

    if (actorsToDisplay.length) {
      // render the actors' avatars, now if they've already arrived, or via event handling
      // later if the ajax hasn't returned yet
      this.renderChild(new libs.shelbyGT.ListView({
        collection : actorsCollection,
        doStaticRender : true,
        el : this.$('.js-liker-avatars-list'),
        listItemView : 'LikerAvatarItemView'
      }));
    }

  }

});