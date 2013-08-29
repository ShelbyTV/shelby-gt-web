libs.shelbyGT.FollowSourcesView = Support.CompositeView.extend({

  events : {
    "click .js-roll-button:not(.js-busy)" : "_follow"
  },

  template : function(obj){
    return SHELBYJST['user-card'](obj);
  },

  initialize : function(){
  },

  cleanup : function(){
  },

  render : function(){
    var self = this;
    _(this.options.rollCategories).each(function(category, index){
      self.$el.append(self.template({category: category, index: index, context: self.options.context }));
    });

    return this;
  },

  _follow : function(e){
    // even though the inverse action is now described by the button,
    // we prevent click handling with class js-busy
    var $thisButton = $(e.currentTarget).addClass('button_busy js-busy');

    // immediately toggle the button - if the ajax fails, we'll update the next time we render
    var isFollowed = $thisButton.toggleClass('button_enabled visuallydisabled').hasClass('visuallydisabled');
    this.model.set('rolls_followed', this.model.get('rolls_followed')+1);

    // now that we've told the user that their action has succeeded, let's fire off the ajax to
    // actually do what they want, which will very likely succeed
    var onRollJoined = function() {
      // the user should get some new videos in their stream from the newly followed roll,
      // so fetch the dashboard again to make them appear in the guide
      shelby.models.dashboard.fetch({
        data : {
          limit : shelby.config.pageLoadSizes.dashboard
        }
      });
    };
    var thisRoll = new libs.shelbyGT.RollModel({id: $thisButton.data('roll_id')});
    thisRoll.joinRoll(onRollJoined, onRollJoined);

    setTimeout(function(){
      $thisButton.removeClass('button_busy').children('.button_label').text('Following');
    }, 2000);
  }
});
