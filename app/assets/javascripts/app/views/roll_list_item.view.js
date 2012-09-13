libs.shelbyGT.RollItemView = libs.shelbyGT.ActiveHighlightListItemView.extend({

  options : _.extend({}, libs.shelbyGT.ActiveHighlightListItemView.prototype.options, {
    activationStateProperty : 'activeFrameModel'
  }),

  events : function() {
    return this._setupEvents();
  },

  className : 'list_item guide-item clearfix',

  template : function(obj){
    return this._renderTemplate(obj);
  },

  render : function(){
    this.$el.html(this.template({roll : this.model, options: this.options}));
    libs.shelbyGT.ActiveHighlightListItemView.prototype.render.call(this);
  },

  goToRoll : function(){
    shelby.router.navigateToRoll(this.model, {trigger:true});
  },

  unfollowRoll : function(data) {
    console.log('unfollow roll!',data);
  },

  // override ActiveHighlightListItemView abstract method
  doActivateThisItem : function(guideModel){
    var activeFrameModel = guideModel.get('activeFrameModel');
    if (activeFrameModel) {
      var roll = activeFrameModel.get('roll');
      if (roll && this.model.id == roll.id) {
        return true;
      }
    }
    return false;
  },

  _setupEvents : function() {
    //subclasses must override this function to return an events object for this view
    alert('Your RollItemView subclass must override _setupEvents()');
  },

  _renderTemplate : function(obj) {
    //subclasses must override this function to render a specific JST template for this view
    alert('Your RollItemView subclass must override _renderTemplate()');
  }/*,

  followOrUnfollowRoll : function() {
    var self = this;
    var currentRollModel = this.model.get('currentRollModel');
    var $thisButton = this.$('.js-roll-item-unfollow');
    // immediately toggle the button - if the ajax fails, we'll update the next time we render
    var isUnfollow = $thisButton.toggleClass('re-follow').hasClass('re-follow');
    var wasUnfollow = !isUnfollow;
    // even though the inverse action is now described by the button, we prevent click handling
    // with class js-busy until the ajax completes
    $thisButton.text(isUnfollow ? 'Unfollow' : 'Follow').addClass('js-busy');

    // now that we've told the user that their action has succeeded, let's fire off the ajax to
    // actually do what they want, which will very likely succeed
    var clearBusyFunction = function() {
      self.$('.js-roll-item-unfollow').removeClass('js-busy');
    };
    if (wasUnfollow) {
      currentRollModel.leaveRoll(clearBusyFunction, clearBusyFunction);
    } else {
      currentRollModel.joinRoll(clearBusyFunction, clearBusyFunction);
    }
  }*/

});
