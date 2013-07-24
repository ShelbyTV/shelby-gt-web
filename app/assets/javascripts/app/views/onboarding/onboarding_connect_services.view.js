libs.shelbyGT.OnboardingConnectServicesView = Support.CompositeView.extend({

  events : {
    "click .js-onboarding-advance-stage" : "_onAdvanceStage"
  },

  initialize : function(){
    this.model.bind('change:action', this._onChangeAction, this);
    this.model.bind('change:numFriends', this._onChangeNumFriends, this);
    this.model.bind('change:numVideos', this._onChangeNumVideos, this);
  },

  _cleanup : function() {
    this.model.unbind('change:action', this._onChangeAction, this);
    this.model.unbind('change:numFriends', this._onChangeNumFriends, this);
    this.model.unbind('change:numVideos', this._onChangeNumVideos, this);
  },

  template : function(){
    if (this.model.get('action') == 'connect') {
      return SHELBYJST['onboarding/onboarding-connect-services']();
    } else {
      return SHELBYJST['onboarding/onboarding-load-service-videos']({
        currentService : this.model.get('service'),
        otherService : this.model.get('service') == 'facebook' ? 'twitter' : 'facebook'
      });
    }
  },

  render : function(){
    var self = this;

    this.$el.html(this.template());

    _(['twitter', 'facebook']).each(function(service){
      if (_(shelby.models.user.get('authentications')).any(function(auth){return auth.provider == service;})) {
        self.$('.js-authorize--' + service).addClass('disabled').find('.button_label').text('Connected');
      }
    });

    return this;
  },

  _onChangeAction : function(model, action) {
    var self = this;

    if (action == 'load') {
      shelby.models.rollFollowings.fetch({
        success : function(model, response, option){
          // todo: keep loading the rollfollowings until the number stabilizes
          self.model.set('numFriends', model.get('rolls').length);
          var numVideos = model.get('rolls').reduce(function(count, roll){ return count + roll.get('frame_count'); }, 0);
          setTimeout(function(){
            self.model.set('numVideos', numVideos);
          }, 2000);
        }
      });
      // shelby.models.dashboard.fetch({
      //   data : {
      //     limit : shelby.config.pageLoadSizes.dashboard
      //   },
      //   success : function(model, response, option){
      //     // we fetched the dashboard and we want to collect some stats and show them to the user
      //     var uniqueVideosFromService = model.get('dashboard_entries').chain().map(
      //       // loop through the frames
      //       function(d){return d.get('frame');}
      //     ).filter(
      //       // only look at the frames that come from the service we just connected
      //       function(f){return f.has('creator') && f.get('creator').has('authentications') && _(f.get('creator').get('authentications')).any(function(a){return a.provider == this.model.get('service');});}
      //     ).map(
      //       // loop through the videos of those frames
      //       function(f){return f.get('video');}
      //     ).map(
      //       // get their ids
      //       function(v){return v.get('id');}
      //     ).unique().value().length; // and count the number of unique videos that came from that service


      //     console.log(result);
      //   }
      // });
    }
    this.render();
  },

  _onChangeNumFriends : function(model, numFriends) {
    this.$('.js-num-friends').text(numFriends);
    this.$('.js-progress-list').children().eq(1).removeClass('load_progress--loading');
  },

  _onChangeNumVideos : function(model, numVideos) {
    this.$('.js-num-videos').text(numVideos);
    this.$('.js-progress-list').children().eq(2).removeClass('load_progress--loading');
  },

  _onAdvanceStage : function(e){
    e.preventDefault();
    if (this.model.get('action') == 'connect') {
      this.model.set('action', 'load');
      e.stopPropagation();
    }
  }

});
