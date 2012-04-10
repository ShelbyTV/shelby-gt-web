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

    initialize : function(){
      this.model.bind('change', this.updateChild, this);
      Backbone.Events.bind('playback:next', this._nextVideo, this);
    },

    _cleanup : function() {
      this.model.unbind('change', this.updateChild, this);
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

      //this.appendChild(new libs.shelbyGT.AnonGuideView());
      this.appendChild(new displayComponents.viewProto({model: displayComponents.model}));
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
