( function(){

  // shorten names of included library prototypes
  var DisplayState = libs.shelbyGT.DisplayState;
  var GuideModel = libs.shelbyGT.ListView;
  var DashboardView = libs.shelbyGT.DashboardView;
  var RollListView = libs.shelbyGT.RollListView;
  var RollView = libs.shelbyGT.RollView;
  var UserPreferencesView = libs.shelbyGT.UserPreferencesView;
  var HelpView = libs.shelbyGT.HelpView;
  var TeamView = libs.shelbyGT.TeamView;
  var CopyrightView = libs.shelbyGT.CopyrightView;

  libs.shelbyGT.GuideView = Support.CompositeView.extend({

    el: '#guide',

    _listView : null,

    initialize : function(){
      this.model.bind('change', this.updateChild, this);
      shelby.models.userDesires.bind('change:rollActiveFrame', this.rollActiveFrame, this);
      Backbone.Events.bind('playback:next', this._nextVideo, this);
    },

    _cleanup : function() {
      this.model.unbind('change', this.updateChild, this);
      shelby.models.userDesires.unbind('change:rollActiveFrame', this.rollActiveFrame, this);
      Backbone.Events.unbind('playback:next', this._nextVideo, this);
    },

    updateChild : function(model){
      // only render a new content pane if the contentPane* attribtues have been updated
      var changedAttrs = model.changedAttributes();
      if (!changedAttrs.displayState && !changedAttrs.currentRollModel) {
        return;
      }
      this._leaveChildren();
      this._mapAppendChildView();
      this._setGuideTop();
    },

    _setGuideTop : function(){
      var self = this;
      //biggest ugliest hack of the year:...
      setTimeout(function(){
        self.$el.css('top', $('#js-header-guide').height());
      }, shelby.models.user.get('anon') ? 1000 : 0);
    },

    _mapAppendChildView : function(){
      var displayComponents;
      switch (this.model.get('displayState')) {
        case DisplayState.dashboard :
          displayComponents = {
            viewProto : DashboardView,
            model : shelby.models.dashboard,
            limit : shelby.config.pageLoadSizes.dashboard
          };
         break;
        case DisplayState.rollList :
          displayComponents = {
            viewProto : RollListView,
            model : shelby.models.user
          };
          break;
        case DisplayState.standardRoll :
        case DisplayState.watchLaterRoll :
          displayComponents = {
            viewProto : RollView,
            model : this.model.get('currentRollModel'),
            limit : shelby.config.pageLoadSizes.roll
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
        case DisplayState.copyright :
          displayComponents = {
            viewProto : CopyrightView,
            model : shelby.models.user
          };
          break;
      }

      var options = {model:displayComponents.model}
      if (displayComponents.limit) {
        options.limit = displayComponents.limit;
      }
      this._listView = new displayComponents.viewProto(options);
      this.appendChild(this._listView);
    },

    rollActiveFrame: function(){
      var activeFrameModel = this.model.get('activeFrameModel');
      if (activeFrameModel) {
        var currentDisplayState = this.model.get('displayState');
        if (currentDisplayState == DisplayState.dashboard ||
            currentDisplayState == DisplayState.standardRoll || currentDisplayState == DisplayState.watchLaterRoll) {
          // try to find the active frame in the current list view and activate its
          // rolling view
          if (this._listView) {
            if (this._listView.activateFrameRollingView(activeFrameModel)) {
              return;
            }
          }
        }

        // if no frame view for the active frame currently exists, reroute to the rerolling url
        // for the frame, which will bring up the frame's source roll, activate the frame, then
        // reveal is rolling view
        var rollId = this.model.get('activeFrameModel').get('roll').id;
        var frameId = this.model.get('activeFrameModel').id;
        shelby.router.navigate('roll/' + rollId + '/frame/' + frameId + '/rollit', {trigger:true});
      }
    },

    scrollToActiveFrameView: function(){
      this._listView.scrollToActiveFrameView();
    },

    scrollToChildElement: function(element){
      this.$el.scrollTo(element, {duration:200, axis:'y'});
    },

    // appropriatly advances to the next video (in dashboard or a roll)
    _nextVideo : function(){
      var _currentModel,
          _frames,
          _index,
          _currentFrame = shelby.models.guide.get('activeFrameModel');

      switch (this.model.get('displayState')) {
        case libs.shelbyGT.DisplayState.dashboard :
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
      
      _index = (_frames.indexOf(_currentFrame) + 1) % _frames.length;

      shelby.models.guide.set('activeFrameModel', _frames[_index]);
    }

  });

} ) ();
