libs.shelbyGT.RollHeaderView = Support.CompositeView.extend({

  events : {
    "click .js-share-roll" : "_toggleShareRollVisibility",
		"click .rolls-add" : "_toggleJoinRoll"
  },

  el : '#roll-header',

  _shareRollView: null,

  _rollModel: null,

  template : function(obj){
    return JST['roll-header'](obj);
  },

  initialize : function(){
    this.model.bind('change:displayState', this._updateVisibility, this);
    this.model.bind('change:currentRollModel', this._updateRollHeaderView, this);
  },

  _cleanup : function(){
    this.model.unbind('change:displayState', this._updateVisibility, this);
    this.model.unbind('change:currentRollModel', this._updateRollHeaderView, this);
  },

  render : function(){
    this.$el.html(this.template());
    this._shareRollView = new libs.shelbyGT.ShareRollView({model:shelby.models.share});
    this.renderChild(this._shareRollView);
    if (this.model.get('displayState') == libs.shelbyGT.DisplayState.standardRoll) this.$el.show();
  },

  _toggleShareRollVisibility : function(){
    this._shareRollView.$el.toggle();
  },

  _updateVisibility : function(guideModel, displayState){
    if (displayState == libs.shelbyGT.DisplayState.standardRoll) {
      this.$el.show();
    } else {
      // collapse/hide child views
      this._shareRollView.$el.hide();
      this.$el.hide();
    }
  },

	_toggleJoinRoll : function() {
		var self = this;
		if ( shelby.models.user.followsRoll(this._rollModel.id) ){
      this._rollModel.leaveRoll(function(){
        self._updateJoinButton('Join');
      });
		}
		else {
      this._rollModel.joinRoll(function(){
        self._updateJoinButton('Leave');
      });
		}
	},
	
	_updateJoinButton : function(action){
    this.$('.rolls-add').text(action+' Roll');
		// refresh the user with roll_followings
    shelby.models.user.fetch({ data: {include_rolls:true} });
	},

  _updateRollHeaderView : function() {
    this._shareRollView.$el.hide();
    // set roll model
    this._rollModel = this.model.get('currentRollModel');
    // set text to leave/join roll
    var _buttonText = shelby.models.user.followsRoll(this._rollModel.id) ? 'Leave Roll' : 'Join Roll';
    this.$('.rolls-add').text(_buttonText);
  }

});
