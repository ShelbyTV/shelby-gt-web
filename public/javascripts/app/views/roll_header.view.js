libs.shelbyGT.RollHeaderView = Support.CompositeView.extend({

  events : {
    "click .js-share-roll" : "_toggleShareRollVisibility",
		"click .rolls-add" : "_toggleJoinRoll"
  },

  el : '#roll-header',

  _shareRollView: null,

  template : function(obj){
    return JST['roll-header'](obj);
  },

  initialize : function(){
    this.model.bind('change:displayState', this._updateVisibility, this);
    this.model.bind('change:currentRollModel', this._updateView, this);
  },

  _cleanup : function(){
    this.model.unbind('change:displayState', this._updateVisibility, this);
    this.model.unbind('change:currentRollModel', this._updateView, this);
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
		var _rollModel = this.model.get('currentRollModel');
		// if user doesnt follow roll call:
		if ( shelby.models.user.followsRoll(this.model.get('currentRollModel').id) ){
			console.log("follows roll!");
			_rollModel.leaveRoll(function(){ console.log("left roll!"); });
		}
		else {
			console.log("doesnt follows roll... yet");
			_rollModel.joinRoll(function(){ console.log("joined roll!"); });
		}
	},

  _updateView : function() {
    this._shareRollView.$el.hide();
    // set text to leave/join roll
    var _buttonText = shelby.models.user.followsRoll(this.model.get('currentRollModel').id) ? 
            'Leave Roll' : 'Join Roll';
    this.$('.rolls-add').text(_buttonText);
  }

});
