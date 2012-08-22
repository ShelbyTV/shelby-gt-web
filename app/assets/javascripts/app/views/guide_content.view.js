( function(){

  // shorten names of included library prototypes
  var DisplayState = libs.shelbyGT.DisplayState;
  var PlayingState = libs.shelbyGT.PlayingState;
  var DashboardModel = libs.shelbyGT.DashboardModel;
  var DashboardView = libs.shelbyGT.DashboardView;
  var RollListView = libs.shelbyGT.RollListView;
  var RollView = libs.shelbyGT.RollView;
  var UserPreferencesView = libs.shelbyGT.UserPreferencesView;
  var HelpView = libs.shelbyGT.HelpView;
  var TeamView = libs.shelbyGT.TeamView;
  var LegalView = libs.shelbyGT.LegalView;
  var GuidePresentation = libs.shelbyGT.GuidePresentation;
  var SpinnerStateModel = libs.shelbyGT.SpinnerStateModel;
  var contentRollsEnum = libs.shelbyGT.GuidePresentation.content.rolls;

  libs.shelbyGT.GuideContentView = Support.CompositeView.extend({

    el: '#guide',

    _listView : null,

    _dashboardMasterCollection : null,
    _dashboardView : null,

    _currentRollMasterCollection : null,
    _currentRollView : null,

    initialize : function(){
      this.model.bind('change', this._onGuideModelChange, this);
      this.model.bind('change:activeFrameModel', this._onActiveFrameModelChange, this);
      this.model.bind('change:disableSmartRefresh', this._onDisableSmartRefresh, this);
      shelby.models.userDesires.bind('change:changeVideo', this._onChangeVideo, this);
      Backbone.Events.bind('playback:next', this._onPlaybackNext, this);
      this._dashboardMasterCollection = new Backbone.Collection();
      if (shelby.models.dashboard) {
        this._dashboardMasterCollection.reset(shelby.models.dashboard.get('dashboard_entries').models);
      }
    },

    _cleanup : function() {
      this.model.unbind('change', this._onGuideModelChange, this);
      this.model.unbind('change:activeFrameModel', this._onActiveFrameModelChange, this);
      this.model.unbind('change:disableSmartRefresh', this._onDisableSmartRefresh, this);
      shelby.models.userDesires.unbind('change:changeVideo', this._onChangeVideo, this);
      Backbone.Events.unbind('playback:next', this._onPlaybackNext, this);
    },

    _onGuideModelChange : function(model){
      // only render a new content pane if relevant attribtues have been updated
      var _changedAttrs = _(model.changedAttributes());
      if (!_changedAttrs.has('displayState') &&
          !_changedAttrs.has('currentRollModel') &&
          !_changedAttrs.has('sinceId') &&
          !_changedAttrs.has('pollAttempts') &&
          !_changedAttrs.has('rollListContent') &&
          !_changedAttrs.has('displayIsolatedRoll')) {
        return;
      }
      if (model.get('displayState') != libs.shelbyGT.DisplayState.explore
        && model.get('displayState') != libs.shelbyGT.DisplayState.onboarding) {
        this._updateChild(model);
      }
    },

    _updateChild : function(guideModel) {
        this._leaveChildren();
        this._mapAppendChildView(guideModel);
        this._setGuideTop();
    },

    _setGuideTop : function(){
      var allHeadersHeight = _.reduce($("#js-guide-header"), function(memo, el){ return memo + $(el).height(); }, 0);
      $('#js-guide-body').css('top', allHeadersHeight);
    },

    _mapAppendChildView : function(guideModel){
      switch (this.model.get('displayState')) {
        case DisplayState.dashboard :
          displayParams = {
            viewProto : DashboardView,
            model : shelby.models.dashboard,
            options : {
              doSmartRefresh : !this._dashboardMasterCollection.isEmpty(),
              doStaticRender : true,
              fetchParams : {
                include_children : true,
                sinceId : this.model.get('sinceId')
              },
              limit : shelby.config.pageLoadSizes.dashboard,
              masterCollection : this._dashboardMasterCollection
            },
            spinner : true
          };
         break;
        case DisplayState.rollList :
          var binarySearchOffset, sourceModel, listItemView;
          binarySearchOffset = shelby.config.db.rollFollowings.numSpecialRolls;
          sourceModel = shelby.models.rollFollowings;
          listItemView = 'RollItemRollView';
          var shouldFetch = true;
          displayParams = {
            viewProto : RollListView,
            model : sourceModel,
            onAppendChild : this._populateRollList,
            options : {
              binarySearchOffset : binarySearchOffset,
              doSmartRefresh : !sourceModel.get('rolls').isEmpty(),
              doStaticRender : true,
              listItemView : listItemView
            },
            shouldFetch : shouldFetch,
            spinner : shouldFetch
          };
          break;
        case DisplayState.standardRoll :
        case DisplayState.watchLaterRoll :
        case DisplayState.queue :
          this._currentRollMasterCollection = new Backbone.Collection();
          displayParams = {
            viewProto : RollView,
            model : this.model.get('currentRollModel'),
            options : {
              fetchParams : {
                include_children : true,
                sinceId : this.model.get('sinceId')
              },
              limit : shelby.config.pageLoadSizes.roll,
              masterCollection : this._currentRollMasterCollection
            },
            spinner : true
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

      switch (this.model.get('displayState')) {
        case DisplayState.dashboard :
          this._dashboardView = this._listView;
          break;
        case DisplayState.standardRoll :
        case DisplayState.watchLaterRoll :
        case DisplayState.queue :
          this._currentRollView = this._listView;
          break;
      }

      // cancel any other previous ajax requests' ability to hide the spinner
      shelby.views.guideSpinner.setModel(null);
      if (!(_(guideModel.changedAttributes()).has('pollAttempts') && guideModel.get('pollAttempts') > 1)){
        // hide the spinner ourselves, unless we're polling the dashboard, in which case, its just going to
        // be reshown in a few lines anyway, so don't hide - prevents flickering
        shelby.views.guideSpinner.hide();
      }
      
      //remove any current guide overlay views
      shelby.models.guideOverlay.clearAllGuideOverlays();

      // display the new child list view constructed appropriately for the display state
      this.appendChild(this._listView);

      // show the spinner if applicable
      if (displayParams.spinner) {
        shelby.views.guideSpinner.show();
      }

      // perform any additional handling, if specified
      if (displayParams.onAppendChild) {
        displayParams.onAppendChild.call(this, guideModel, displayParams.shouldFetch);
      }
    },

    _populateRollList : function(guideModel, shouldFetch) {
      if (shouldFetch) {
        var rollCollection = shelby.models.rollFollowings;
        var fetchUrl = shelby.config.apiRoot + '/user/' + shelby.models.user.id + '/rolls/following';
        var oneTimeSpinnerState = new SpinnerStateModel();
        shelby.views.guideSpinner.setModel(oneTimeSpinnerState);
        $.when(rollCollection.fetch({
            url : fetchUrl,
            data : {frames:true}
        })).always(function(){oneTimeSpinnerState.set('show', false);});
      }
    },

    scrollToChildElement : function(element){
      // if this is the first element, offset a bit, need this for adding video via url area
      if (element == $('ul.roll').children()[0]){
        $('#js-guide-wrapper').scrollTo(element, {duration:200, axis:'y', offset:{top:-75}});
      }
      else {
        $('#js-guide-wrapper').scrollTo(element, {duration:200, axis:'y'});
      }
    },

    _hideGuideSpinner: function(){
      shelby.views.guideSpinner.hide();
    },

    _onActiveFrameModelChange : function(guideModel, activeFrameModel){
      if (activeFrameModel) {
        if (!guideModel.get('skippingVideo')) {
          if (guideModel.get('displayState') == DisplayState.dashboard) {
            guideModel.set({
              playingState : PlayingState.dashboard
            });
          } else {
            guideModel.set({
              playingState : PlayingState.roll,
              // XXX TODO in this case, when the activeFrame model changes, everything is fine.
              // however, if we're playing a roll, switch to dashboard, and switch back to the
              // same roll, the new roll view / frame collection isn't the same as the playing
              // frame group collection, so the UI and frame skipping logic don't match.
              playingRollFrameGroupCollection : this._currentRollView.frameGroupCollection
            });
          }
        }
      } else {
        guideModel.set({
          playingState : PlayingState.none,
          playingRollFrameGroupCollection : null
        });
      }
    },

    _onDisableSmartRefresh : function(guideModel, disableSmartRefresh){
      if (disableSmartRefresh) {
        if (this._listView) {
          this._listView.options.doSmartRefresh = false;
        }
        guideModel.set('disableSmartRefresh', false);
      }
    },

    _onChangeVideo : function(userDesiresModel, videoChangeValue){
      if (typeof videoChangeValue==='undefined') return false;
      this._skipVideo(videoChangeValue);
    },

    _onPlaybackNext : function(){
      this._skipVideo(1);
    },

    // appropriately changes the next video (in dashboard or a roll)
    _skipVideo : function(skip){

      // undefined skip causes infinite loop below... so just return here?
      if (!skip) {
        return;
      } 

      var self = this,
          _frameGroups,
          _index = -1,
          _currentFrameGroupIndex = -1,
          _currentFrame = this.model.get('activeFrameModel');
     
      if (this.model.get('playingState') == PlayingState.dashboard) {
        _frameGroups = this._dashboardView.frameGroupCollection.models;
      } else {
        _frameGroups = this.model.get('playingRollFrameGroupCollection').models;
      }

      if (!_frameGroups) {
        return;
      }

      var _frameInCollection = _(_frameGroups).find(function(frameGroup){return frameGroup.get('frames').at(0).get('video').id == _currentFrame.get('video').id;});
      if (_frameInCollection) {
        _currentFrameGroupIndex = _frameGroups.indexOf(_frameInCollection);
        _index = _currentFrameGroupIndex + skip;
      } else {
        _currentFrameGroupIndex = 0;
      }

      // loop to skip collapsed frames (looping should only happen in dashboard view)
      while (true) {

        // bad index means we just stay on current video...
        if (_index < 0) {
          _index = _currentFrameGroupIndex;
          break;
        } else if (_index >= _frameGroups.length) {
          // ideally would load more videos here? do something like _loadMoreWhenLastItemActive
          _index = _currentFrameGroupIndex;
          break;
        }

        if (!_frameGroups) {
          _index = 0;
          break;
        }

        var _indexFrameGroupInCollection = _frameGroups[_index];

        if (_indexFrameGroupInCollection.get('collapsed')) {
          _index = _index + skip; // keep looking for a non-collapsed frame group to play
        } else {
          break; // otherwise we have a good non-collapsed frame group to play
        }
      }

      this.model.set({
        activeFrameModel : _frameGroups[_index].get('frames').at(0),
        skippingVideo : true
      });

      this.model.set('skippingVideo', false);
    }

  });

} ) ();
