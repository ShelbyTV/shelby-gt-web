( function(){

  // shorten names of included library prototypes
  var DisplayState = libs.shelbyGT.DisplayState;
  var DashboardModel = libs.shelbyGT.DashboardModel;
  var DashboardView = libs.shelbyGT.DashboardView;
  var MeListView = libs.shelbyGT.MeListView;
  var FreshPlayRollView = libs.shelbyGT.FreshPlayRollView;
  var RollView = libs.shelbyGT.RollView;
  var VideoSearchView = libs.shelbyGT.VideoSearchView;
  var UserPreferencesView = libs.shelbyGT.UserPreferencesView;
  var HelpView = libs.shelbyGT.HelpView;
  var TeamView = libs.shelbyGT.TeamView;
  var LegalView = libs.shelbyGT.LegalView;
  var SpinnerStateModel = libs.shelbyGT.SpinnerStateModel;
  var QueueEmptyIndicatorView = libs.shelbyGT.QueueEmptyIndicatorView;

  libs.shelbyGT.GuideContentView = Support.CompositeView.extend({

    el: '#guide',

    _listView : null,

    _dashboardMasterCollection : null,

    _currentChannelMasterCollection : null,
    _currentChannelView : null,

    _currentRollMasterCollection : null,

    initialize : function(){
      this.model.bind('change', this._onGuideModelChange, this);
      this.model.bind('reposition', this._onReposition, this);
      this._dashboardMasterCollection = new Backbone.Collection();
      if (shelby.models.dashboard) {
        this._dashboardMasterCollection.reset(shelby.models.dashboard.get('dashboard_entries').models);
      }
    },

    _cleanup : function() {
      this.model.unbind('change', this._onGuideModelChange, this);
      this.model.unbind('reposition', this._onReposition, this);
    },

    _onGuideModelChange : function(model){
      // only render a new content pane if relevant attribtues have been updated
      var _changedAttrs = _(model.changedAttributes());
      if (!_changedAttrs.has('displayState') &&
          !_changedAttrs.has('currentRollModel') &&
          !_changedAttrs.has('sinceId') &&
          !_changedAttrs.has('displayIsolatedRoll') &&
          !_changedAttrs.has('currentChannelId')) {
        return;
      }
      if (model.get('displayState') != libs.shelbyGT.DisplayState.onboarding &&
          model.get('displayState') != libs.shelbyGT.DisplayState.dotTv) {
        this._updateChild(model);
      }
      $('.js-guide').addClass('animate_module');
    },

    _updateChild : function(guideModel) {
        this._leaveChildren();
        this._mapAppendChildView(guideModel);
        this.model.trigger('reposition');
    },

    _onReposition : function() {
      this._setGuideTop();
    },

    _setGuideTop : function(){
      var allHeadersHeight = _.reduce($("#js-guide-header"), function(memo, el){ return memo + $(el).height(); }, 0);
      $('#js-guide-body').css('top', allHeadersHeight);
    },

    _mapAppendChildView : function(guideModel){
      var currentDisplayState = this.model.get('displayState');

      switch (currentDisplayState) {
        case DisplayState.dashboard :
        case DisplayState.channel :
          var doSmartRefresh;
          var masterCollection;
          var _playlistType;
          if (currentDisplayState == DisplayState.dashboard) {
            doSmartRefresh = !this._dashboardMasterCollection.isEmpty();
            masterCollection = this._dashboardMasterCollection;
            _playlistType = libs.shelbyGT.PlaylistType.dashboard;
          } else {
            doSmartRefresh = false;
            masterCollection = this._currentChannelMasterCollection = new Backbone.Collection();
            _playlistType = libs.shelbyGT.PlaylistType.channel;
          }
          displayParams = {
            viewProto : DashboardView,
            model : shelby.models.dashboard,
            options : {
              doSmartRefresh : doSmartRefresh,
              doStaticRender : true,
              fetchParams : {
                include_children : true
              },
              playlistType : _playlistType,
              firstFetchLimit : shelby.config.pageLoadSizes.dashboard,
              limit : shelby.config.pageLoadSizes.dashboard + 1,
              masterCollection : masterCollection
            },
            spinner : true
          };
         break;
        case DisplayState.rollList :
          displayParams = {
            viewProto : MeListView,
            model : shelby.models.rollFollowings,
            onAppendChild : this._populateRollList,
            shouldFetch : true,
            spinner : true
          };
          break;
        case DisplayState.standardRoll :
          this._currentRollMasterCollection = new Backbone.Collection();
          displayParams = {
            viewProto : FreshPlayRollView,
            model : this.model.get('currentRollModel'),
            options : {
              masterCollection : this._currentRollMasterCollection
            },
            spinner : true
          };
          break;
        case DisplayState.watchLaterRoll :
          this._currentRollMasterCollection = new Backbone.Collection();
          displayParams = {
            viewProto : RollView,
            model : this.model.get('currentRollModel'),
            options : {
              collapseViewedFrameGroups : true,
              emptyIndicatorViewProto : currentDisplayState == DisplayState.watchLaterRoll ? QueueEmptyIndicatorView : null,
              fetchParams : {
                include_children : true
              },
              firstFetchLimit : shelby.config.pageLoadSizes.roll,
              limit : shelby.config.pageLoadSizes.roll + 1, // +1 b/c fetch is inclusive of frame_id sent to skip
              masterCollection : this._currentRollMasterCollection
            },
            spinner : true
          };
          break;
        case DisplayState.search :
          this._currentRollMasterCollection = new Backbone.Collection();
          displayParams = {
            viewProto : VideoSearchView,
            collection : shelby.collections.videoSearchResultFrames,
            options : {
              collapseViewedFrameGroups : false,
              comparator : function(frameGroup1, frameGroup2) {
                var video1 = frameGroup1.get('frames').at(0).get('video');
                var score1 = video1.get('score');
                var video2 = frameGroup2.get('frames').at(0).get('video');
                var score2 = video2.get('score');
                if (score1 < score2) {
                  return -1;
                } else if (score1 > score2) {
                  return 1;
                } else {
                  // we want to expliciltly and deterministically break ties in sort order
                  // BECAUSE backbone can sometimes change the order of a collection without notifying you when 3+ items tie on the
                  // comparator

                  // we'll just use the provider name for now, so the interleaving of provider videos will be the same every time
                  var videoProvider1 = video1.get('provider_name');
                  var videoProvider2 = video2.get('provider_name');
                  if (videoProvider1 > videoProvider2) {
                    return -1;
                  } else if (videoProvider1 < videoProvider2) {
                    return 1;
                  } else {
                    return 0;
                  }
                }
              },
              doStaticRender : true,
              masterCollection : this._currentRollMasterCollection,
              videoSearchModel : shelby.models.videoSearch
            }
          };
          break;
        case DisplayState.userPreferences :
        case DisplayState.tools :
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

      // cancel any other previous ajax requests' ability to hide the spinner
      shelby.views.guideSpinner.setModel(null);
      shelby.views.guideSpinner.hide();

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
    }

  });

} ) ();
