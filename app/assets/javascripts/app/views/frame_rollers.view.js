libs.shelbyGT.FrameRollersView = Support.CompositeView.extend({

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
    //calculate roller info
    var rollersCollection = new libs.shelbyGT.UserCollection(),
    rollersToDisplay, remainingRollers;

    if (this.model.primaryDashboardEntryIsPrioritized()){
      var rollerInfo = this.model.getFriendRollerInfo(false);
      rollersToDisplay = rollerInfo.rollers.models.slice(0, this.options.numAvatarsDisplayed);
      if (rollersToDisplay.length) {
        rollersCollection.add(rollersToDisplay);
      }
      remainingRollers = rollerInfo.totalRollers - rollersToDisplay.length;
    } else {
      var dupeFrames = this.model.getDuplicateFramesToDisplay();
      rollersToDisplay = _(dupeFrames.slice(0, this.options.numAvatarsDisplayed)).map(function(frame) {
        return frame.get('creator');
      });
      if (rollersToDisplay.length) {
        rollersCollection.add(rollersToDisplay);
      }
      remainingRollers = dupeFrames.length - rollersToDisplay.length;
    }

    this.$el.html(this.template({
      likers : rollersToDisplay,
      remainingLikes : remainingRollers
    }));

    this.$el.toggleClass('frame-likes--hide', rollersToDisplay.length == 0);

    if (rollersToDisplay.length) {
      // render the rollers' avatars, now if they've already arrived, or via event handling
      // later if the ajax hasn't returned yet
      this.renderChild(new libs.shelbyGT.ListView({
        collection : rollersCollection,
        doStaticRender : true,
        el : this.$('.js-liker-avatars-list'),
        listItemView : 'ActorAvatarItemView',
        listItemViewAdditionalParams : {
          actorDescription : 'roller'
        }
      }));
    }

  }

});