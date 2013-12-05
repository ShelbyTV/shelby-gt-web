libs.shelbyGT.FollowSourcesView = Support.CompositeView.extend({

  _pollingTimeout : null,

  tagName: 'ul',

  className: 'list',

  options : {
    pollDashboardAfterFollow : false
  },

  events : {
    "click .js-roll-button:not(.js-busy)" : "_follow",
    "click .js-navigate-roll" : "_navigateRoll"
  },

  template : function(obj){
    return SHELBYJST['user-card'](obj);
  },

  initialize : function(){
    if (this.options.pollDashboardAfterFollow) {
      this.model.bind('polling:stop', this._checkAndStopPolling, this);
    }
  },

  cleanup : function(){
    if (this.options.pollDashboardAfterFollow) {
      this.model.unbind('polling:stop', this._checkAndStopPolling, this);
    }
  },

  render : function(){
    var self = this;
    _(this.options.rollCategories).each(function(category, index){
      self.$el.append(self.template({
        category: category,
        clickableUser: self.options.clickableUser,
        context: self.options.context,
        index: index
      }));
    });

    return this;
  },

  _follow : function(e){
    var self = this;

    // even though the inverse action is now described by the button,
    // we prevent click handling with class js-busy
    var $thisButton = $(e.currentTarget).addClass('button_busy js-busy');

    // immediately toggle the button - if the ajax fails, we'll update the next time we render
    var isFollowed = $thisButton.toggleClass('button_enabled visuallydisabled').hasClass('visuallydisabled');
    this.model.set('rolls_followed', this.model.get('rolls_followed')+1);

    // now that we've told the user that their action has succeeded, let's fire off the ajax to
    // actually do what they want, which will very likely succeed
    var onRollJoined;
    var dbeCountBeforeFollow = shelby.models.dashboard.get('dashboard_entries').length;
    if (this.options.pollDashboardAfterFollow) {
      // if we were still polling the dashboard from a previous roll join, we can stop now
      this._checkAndStopPolling();
      onRollJoined = function() {
        // poll the dashboard to display the videos that have backfilled into the user's stream
        // as a result of following the new roll
        // poll until new dashboard entries have been fetched in case backfilling of dashboard entries on the backend is slow
        shelby.models.dashboard.fetch({
          cache : false,
          data : {
            limit : shelby.config.pageLoadSizes.dashboard
          },
          success : function(){
            if (shelby.models.dashboard.get('dashboard_entries').length <= dbeCountBeforeFollow) {
              // if we haven't found any new videos from the backfill yet, keep polling
              self._pollingTimeout = setTimeout(onRollJoined, 250);
            } else {
              // we've found some video, polling is done
              self._pollingTimeout = null;
            }
          }
        });
      };
    } else {
      onRollJoined = function() {
        // the user should get some new videos in their stream from the newly followed roll,
        // so fetch the dashboard again to make them appear in the guide
        shelby.models.dashboard.fetch({
          data : {
            limit : shelby.config.pageLoadSizes.dashboard
          }
        });
      };
    }
    var thisRoll = new libs.shelbyGT.RollModel({id: $thisButton.data('roll_id')});
    thisRoll.joinRoll(onRollJoined, onRollJoined);

    setTimeout(function(){
      $thisButton.removeClass('button_busy').children('.button_label').text('Following');
    }, 2000);
  },

  _checkAndStopPolling : function() {
    if (this._pollingTimeout) {
      clearTimeout(this._pollingTimeout);
      this._pollingTimeout = null;
    }
  },

  _navigateRoll : function(e) {
    e.preventDefault();
    var id = $(e.currentTarget).data('roll_id');
    shelby.router.navigate('/roll/'+ id,{trigger:true,replace:false});
  }
});
