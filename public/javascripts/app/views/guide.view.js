( function(){

  // shorten names of included library prototypes
  var DisplayState = libs.shelbyGT.DisplayState;
  var GuideModel = libs.shelbyGT.ListView;
  var DashboardView = libs.shelbyGT.DashboardView;
  var RollListView = libs.shelbyGT.RollListView;
  var RollView = libs.shelbyGT.RollView;
  var UserPreferencesView = libs.shelbyGT.UserPreferencesView;

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
      this.$el.css('top', $('#js-header-guide').height());
    },

    _mapAppendChildView : function(){
      var displayComponents;
      switch (this.model.get('displayState')) {
        case DisplayState.dashboard :
          displayComponents = {
            viewProto : DashboardView,
            model : shelby.models.dashboard
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
            model : this.model.get('currentRollModel')
          };
          break;
        case DisplayState.userPreferences :
          displayComponents = {
            viewProto : UserPreferencesView,
            model : shelby.models.user
          };
          break;
      }

      this._listView = new displayComponents.viewProto({model: displayComponents.model});
      this.appendChild(this._listView);
    },

    rollActiveFrame: function(userDesiresStateModel, rollActiveFrame){
      if (rollActiveFrame) {
        userDesiresStateModel.set('rollActiveFrame', false);
        var currentDisplayState = this.model.get('displayState');
        if (currentDisplayState == DisplayState.dashboard ||
            currentDisplayState == DisplayState.standardRoll || currentDisplayState == DisplayState.watchLaterRoll) {
          // try to find the active frame in the current list view and activate its
          // rolling view
          if (this._listView) {
            if (this._listView.activateFrameRollingView(this.model.get('activeFrameModel'))) {
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
