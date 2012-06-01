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
      shelby.models.userDesires.bind('change:rollActiveFrame', this.rollActiveFrame, this);
      Backbone.Events.bind('playback:next', this._nextVideo, this);
      Backbone.Events.bind('playback:prev', this._prevVideo, this);
    },

    _cleanup : function() {
      this.model.unbind('change', this._onGuideModelChange, this);
      this.model.unbind('change:activeFrameModel', this._onActiveFrameModelChange, this);
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
          !_changedAttrs.has('pollAttempts') &&
          !_changedAttrs.has('rollListContent')) {
        return;
      }
      this._updateChild(model);
    },

    _updateChild : function(guideModel) {
        this._leaveChildren();
        this._mapAppendChildView(guideModel);
        this._setGuideTop();
    },

    _setGuideTop : function(){
      $('#js-guide-wrapper').css('top', $('#js-header-guide').height());
    },

    _mapAppendChildView : function(guideModel){
      switch (this.model.get('displayState')) {
        case DisplayState.dashboard :
          displayParams = {
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
          if (this.model.get('rollListContent') == GuidePresentation.content.rolls.browse) {
            sourceModel = shelby.models.browseRolls;
          } else {
            sourceModel = shelby.models.rollFollowings;
          }
          var shouldFetch = GuidePresentation.shouldFetchRolls(this.model);
          if (!shouldFetch) {
            viewOptions = {doStaticRender:true};
          } else {
            viewOptions = null;
          }
          displayParams = {
            viewProto : RollListView,
            model : sourceModel,
            onAppendChild : this._populateRollList,
            options : viewOptions,
            shouldFetch : shouldFetch
          };
          break;
        case DisplayState.standardRoll :
        case DisplayState.watchLaterRoll :
          displayParams = {
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
          displayParams = {
            viewProto : UserPreferencesView,
            model : shelby.models.user
          };
          break;
        case DisplayState.help :
          displayParams = {
            viewProto : HelpView,
            model : shelby.models.user
          };
          break;
        case DisplayState.team :
          displayParams = {
            viewProto : TeamView,
            model : shelby.models.user
          };
          break;
        case DisplayState.legal :
          displayParams = {
            viewProto : LegalView,
            model : shelby.models.user
          };
          break;
      }

      var childViewOptions = {
        model : displayParams.model,
        collection : displayParams.collection
      };
      _(childViewOptions).extend(displayParams.options);

      this._listView = new displayParams.viewProto(childViewOptions);

      this.appendChild(this._listView);
      if (displayParams.onAppendChild) {
        displayParams.onAppendChild.call(this, guideModel, displayParams.shouldFetch);
      }
    },

    _populateRollList : function(guideModel, shouldFetch) {
      var self = this;

      if (shouldFetch) {
        var contentIsBrowseRolls = guideModel.get('rollListContent') == libs.shelbyGT.GuidePresentation.content.rolls.browse;
        var rollCollection, fetchUrl;
        if (contentIsBrowseRolls) {
          rollCollection = shelby.models.browseRolls;
          fetchUrl = shelby.config.apiRoot + '/roll/browse';
        } else {
          rollCollection = shelby.models.rollFollowings;
          fetchUrl = shelby.config.apiRoot + '/user/' + shelby.models.user.id + '/rolls/following';
        }

        shelby.views.guideSpinner.show();
        this._hideSpinnerAfter((function(){
          return rollCollection.fetch({
            success : function(){
              if (contentIsBrowseRolls) {
                // mark the browse rolls as fetched so we know we don't need to do it again
                shelby.models.fetchState.set('browseRollsFetched', true);
              }
              shelby.models.autoScrollState.set('tryAutoScroll', true);
            },
            url : fetchUrl
          });
        })());
      } else {
        shelby.models.autoScrollState.set('tryAutoScroll', true);
      }
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

    _hideSpinnerAfter: function(xhr){
      // Backbone's .fetch() calls & returns jQuery's .ajax which returns a jqXHR object: http://api.jquery.com/jQuery.ajax/#jqXHR
      // upon which we append another callback to hide the spinner shown earlier.
      xhr.done(function(){
        shelby.views.guideSpinner.hide();
      });
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
