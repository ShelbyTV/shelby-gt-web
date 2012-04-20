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
    var currentRollModel = this.model.get('currentRollModel');
    if ( shelby.models.user.followsRoll(currentRollModel.id) ){
      currentRollModel.leaveRoll(function(){
        self._updateJoinButton('Join');
        self._refreshUser();
      });
    }
    else {
      currentRollModel.joinRoll(function(){
        self._updateJoinButton('Leave');
        self._refreshUser();
      });
    }
  },

  _updateJoinButton : function(action){
    var addOrRemoveClass = action == 'Leave' ? 'addClass' : 'removeClass';
    // this.$('.rolls-add').text(action+' Roll')[addOrRemoveClass]('rolls-leave');
    this.$('.rolls-add').text(action)[addOrRemoveClass]('rolls-leave');
  },

  _refreshUser : function(){
    // refresh the user with roll_followings
    shelby.models.user.fetch({ data: {include_rolls:true} });
  },

  _updateRollHeaderView : function(guideModel, currentRollModel) {
    this._shareRollView.$el.hide();
    // hide join/leave button if the user is the roll's creator (includes the user's public roll)
    if (currentRollModel.get('creator_id') === shelby.models.user.id){
      this.$('.rolls-add').hide();
      //TODO: do this via html class assignment:
      this.$('#js-roll-header li:first').hide();
      this.$('#js-roll-header li:last').css('width', '100%');
    }
    else{
      this.$('.rolls-add').show();
      //TODO: do this via html class assignment:
      this.$('#js-roll-header li:first').show();
      this.$('#js-roll-header li:last').css('width', '25%');
    }
    // set text to leave/join roll
    var _buttonText = shelby.models.user.followsRoll(currentRollModel.id) ? 'Leave' : 'Join';
    this._updateJoinButton(_buttonText);
  }

});
