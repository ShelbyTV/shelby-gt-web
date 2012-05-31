( function(){

  // shorten names of included library prototypes
  var DisplayState = libs.shelbyGT.DisplayState;
  var DashboardModel = libs.shelbyGT.DashboardModel;
  var DashboardView = libs.shelbyGT.DashboardView;
  var RollListView = libs.shelbyGT.RollListView;
  var RollView = libs.shelbyGT.RollView;
  var UserPreferencesView = libs.shelbyGT.UserPreferencesView;
  var HelpView = libs.shelbyGT.HelpView;
  var TeamView = libs.shelbyGT.TeamView;
  var LegalView = libs.shelbyGT.LegalView;
  var GuidePresentation = libs.shelbyGT.GuidePresentation;

  libs.shelbyGT.GuideView = Support.CompositeView.extend({

    el: '#guide',

    _listView : null,

    initialize : function(){
      this.model.bind('change', this._onGuideModelChange, this);
      this.model.bind('change:activeFrameModel', this._onActiveFrameModelChange, this);
      shelby.models.guidePresentation.bind('change:content', this._onGuidePresentationModelChange, this);
      shelby.models.userDesires.bind('change:rollActiveFrame', this.rollActiveFrame, this);
      Backbone.Events.bind('playback:next', this._nextVideo, this);
      Backbone.Events.bind('playback:prev', this._prevVideo, this);
    },

    _cleanup : function() {
      this.model.unbind('change', this._onGuideModelChange, this);
      this.model.unbind('change:activeFrameModel', this._onActiveFrameModelChange, this);
      shelby.models.guidePresentation.unbind('change:content', this._onGuidePresentationModelChange, this);
      shelby.models.userDesires.unbind('change:rollActiveFrame', this.rollActiveFrame, this);
      Backbone.Events.unbind('playback:next', this._nextVideo, this);
      Backbone.Events.unbind('playback:prev', this._prevVideo, this);
    },

    _onGuideModelChange : function(model){
      // only render a new content pane if relevant attribtues have been updated
      var _changedAttrs = _(model.changedAttributes());
      if (!_changedAttrs.has('displayState') &&
          !_changedAttrs.has('currentRollModel') &&
          !_changedAttrs.has('sinceId') &&
          !_changedAttrs.has('pollAttempts')) {
        return;
      }
      this._updateChild();
    },

    _onGuidePresentationModelChange : function(model){
      this._updateChild(true);
    },

    _updateChild : function(contentChanged) {
      if (this.model.get('displayState') != DisplayState.none) {
        this._leaveChildren();
        this._mapAppendChildView(contentChanged);
        this._setGuideTop();
      }
    },

    _setGuideTop : function(){
      $('#js-guide-wrapper').css('top', $('#js-header-guide').height());
    },

    _mapAppendChildView : function(contentChanged){
      var displayComponents;
      switch (this.model.get('displayState')) {
        case DisplayState.dashboard :
          displayComponents = {
            viewProto : DashboardView,
            model : shelby.models.dashboard,
            options : {
              fetchParams : {
                include_children : true,
                sinceId : this.model.get('sinceId')
              },
              limit : shelby.config.pageLoadSizes.dashboard
            }
          };
         break;
        case DisplayState.rollList :
          var sourceModel;
          if (shelby.models.guidePresentation.get('content') == GuidePresentation.content.rolls.browse) {
            sourceModel = shelby.models.browseRolls;
          } else {
            sourceModel = shelby.models.rollFollowings;
          }
          var viewOptions;
          if (contentChanged && !GuidePresentation.shouldFetchRolls(shelby.models.guidePresentation.previous('content'), shelby.models.guidePresentation.get('content'))) {
            viewOptions = {doStaticRender:true};
          } else {
            viewOptions = null;
          }
          displayComponents = {
            viewProto : RollListView,
            model : sourceModel,
            options : viewOptions
          };
          break;
        case DisplayState.standardRoll :
        case DisplayState.watchLaterRoll :
          displayComponents = {
            viewProto : RollView,
            model : this.model.get('currentRollModel'),
            options : {
              fetchParams : {
                include_children : true,
                sinceId : this.model.get('sinceId')
              },
              limit : shelby.config.pageLoadSizes.roll
            }
          };
          break;
        case DisplayState.userPreferences :
          displayComponents = {
            viewProto : UserPreferencesView,
            model : shelby.models.user
          };
          break;
        case DisplayState.help :
          displayComponents = {
            viewProto : HelpView,
            model : shelby.models.user
          };
          break;
        case DisplayState.team :
          displayComponents = {
            viewProto : TeamView,
            model : shelby.models.user
          };
          break;
        case DisplayState.legal :
          displayComponents = {
            viewProto : LegalView,
            model : shelby.models.user
          };
          break;
      }

      var options = {
        model : displayComponents.model,
        collection : displayComponents.collection
      };
      _(options).extend(displayComponents.options);
      this._listView = new displayComponents.viewProto(options);
      this.appendChild(this._listView);
    },

    rollActiveFrame : function(){
      var activeFrameModel = this.model.get('activeFrameModel');
      if (activeFrameModel) {
        var currentDisplayState = this.model.get('displayState');
        if (currentDisplayState == DisplayState.dashboard ||
            currentDisplayState == DisplayState.standardRoll ||
            currentDisplayState == DisplayState.watchLaterRoll) {
          // try to find the active frame in the current list view and activate its
          // rolling view
          if (this._listView) {
            if (this._listView.activateFrameRollingView(activeFrameModel)) {
              return;
            }
          }
        }

        // no frame view for the active frame currently exists
        if (this.model.get('activeFrameModel').has('roll')) {
          // reroute to the frame in roll url for the frame, which will bring up the frame's source roll,
          // activate the frame, then reveal is rolling view
          var frameId = this.model.get('activeFrameModel').id;
          var rollId = this.model.get('activeFrameModel').get('roll').id;
          shelby.router.navigate('roll/' + rollId + '/frame/' + frameId + '/rollit', {trigger:true});
        } else {
          // the frame has no source roll, so
          // reroute to the entry in stream url for the frame, which will bring up the dashboard,
          // activate the entry, then reveal is rolling view
          shelby.router.navigate('stream/entry/' + this.model.get('activeDashboardEntryModel').id + '/rollit', {trigger:true});
        }
      }
    },

    scrollToChildElement : function(element){
      $('#js-guide-wrapper').scrollTo(element, {duration:200, axis:'y'});
      //this.$el.scrollTo(element, {duration:200, axis:'y'});

    },

    _onActiveFrameModelChange : function(guideModel, activeFrameModel){
      if (!activeFrameModel) {
        // just for completeness, anytime we set the activeFrameModel to null, there is obviously no
        // activeDashboardEntryModel either
        this.model.set('activeDashboardEntryModel', null);
      }
    },
    
    _prevVideo : function(){
      this._skipVideo(-1);
    },
    
    _nextVideo : function(){
      this._skipVideo(1);
    },

    // appropriatly changes the next video (in dashboard or a roll)
    _skipVideo : function(skip){
      var self = this,
          _currentModel,
          _frames,
          _index,
          _currentFrame = shelby.models.guide.get('activeFrameModel');

      switch (this.model.get('displayState')) {
        case libs.shelbyGT.DisplayState.dashboard :
        case libs.shelbyGT.DisplayState.rollList :
          // if the dashboard model hasn't been created yet, fetch it
          // THIS IS A TEMPORARY HACK until next frame is selected from the entity that is playing
          // as opposed to from what is currently displyed in the guide
          if (!shelby.models.dashboard) {
            shelby.models.dashboard = new DashboardModel();
            shelby.models.dashboard.fetch({
              data: {
                include_children : true,
                limit : shelby.config.pageLoadSizes.dashboard
              },
              success: function(model, response){
                self._nextVideo();
              }
            });
            return;
          }
          _currentModel = shelby.models.dashboard;
          _frames = _.map(shelby.models.dashboard.get('dashboard_entries').models, function(c){
            return c.get('frame');
          });
         break;
        case libs.shelbyGT.DisplayState.standardRoll :
        case libs.shelbyGT.DisplayState.watchLaterRoll :
          _currentModel = this.model.get('currentRollModel');
          _frames = _currentModel.get('frames').models;
          break;
      }
      
      _index = (_frames.indexOf(_currentFrame) + skip) % _frames.length;

      shelby.models.guide.set('activeFrameModel', _frames[_index]);
    }

  });

} ) ();
