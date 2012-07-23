libs.shelbyGT.RollItemRollView = libs.shelbyGT.RollItemView.extend({

  options : _.extend({}, libs.shelbyGT.ActiveHighlightListItemView.prototype.options, {
    activationStateProperty : 'activeFrameModel',
    rollModifier : {
      personalRoll: {
        rollClass: ' roll-personal',
        rollTitle: 'You'
      },
      watchLaterRoll: {
        rollClass: ' roll-watch-later',
        rollTitle: 'Watch Later'
      },
      likesRoll: {
        rollClass: ' roll-likes',
        rollTitle: 'Liked'
      },
      nowPlaying: {
        rollClass: ' now-playing',
        rollTitle: 'Now Playing'
      }
    }
  }),

  // RollItemView overrides

  _setupEvents : function() {
    return (
      {
        "click .js-roll-item-button"          : "goToRoll",
        "click .roll-item-stats"              : "goToRoll",
        "click .roll-item-contents-thumbnail" : "goToRoll"
      }
    );
  },

  _renderTemplate : function(obj) {
   return JST['roll-item'](obj);
  }
});
