libs.shelbyGT.RollHeaderView = Support.CompositeView.extend({

  events : {
    "click .js-share-roll:not(.js-busy)" : "_onShareRoll",
    "click .rolls-add" : "_toggleJoinRoll",
		"click .js-edit-roll" : "_toggleRollEditFunctions"
  },

  el : '#roll-header',

  _shareRollView: null,

  _shareRollViewState: null,

  template : function(obj){
    return JST['roll-header'](obj);
  },

  initialize : function(){
    this.model.bind('change:displayState', this._updateVisibility, this);
    this.model.bind('change:currentRollModel', this._updateRollHeaderView, this);
    this._shareRollViewState = new libs.shelbyGT.ShareRollViewStateModel();
    this._shareRollViewState.bind('change:visible', this._onUpdateShareRollViewVisibility, this);
  },

  _cleanup : function(){
    this.model.unbind('change:displayState', this._updateVisibility, this);
    this.model.unbind('change:currentRollModel', this._updateRollHeaderView, this);
    this._shareRollViewState.unbind('change:visible', this._onUpdateShareRollViewVisibility, this);
  },

  render : function(){
    this.$el.html(this.template());
    if (this.model.get('displayState') == libs.shelbyGT.DisplayState.standardRoll ||
        this.model.get('displayState') == libs.shelbyGT.DisplayState.userPersonalRoll) {
      this.$el.show();
    }
  },

  _onShareRoll : function() {
    this._shareRollViewState.toggleVisibility();
  },

  _immediateShowHideShareRollView : function(visible) {
    this._shareRollViewState.set('slide', false);
    this._shareRollViewState.set('visible', visible);
  },

  _onUpdateShareRollViewVisibility : function(shareRollViewStateModel, visible) {
    var self = this;
    this.$('.js-share-roll').addClass('js-busy');
    // the share roll subview is recreated for each time it will be displayed
    // this causes it to be reset to a clean state and helps to make sure that
    // stale callbacks don't affect it
    if (visible) {
      this._shareRollView = new libs.shelbyGT.ShareRollView({
        model : new libs.shelbyGT.ShareModel(),
        viewState : this._shareRollViewState
      });
      this.appendChild(this._shareRollView);
    }
    this._shareRollView.updateVisibility(visible, shareRollViewStateModel.get('slide'), function(){
      if(self._shareRollView) {
        if (self._shareRollView.$el.is(':visible')) {
          this.$('.js-share-roll').text('Cancel').addClass('rolls-share-cancel');
        } else {
          self._shareRollView.leave();
          self._shareRollView = null;
          this.$('.js-share-roll').text('Share Roll').removeClass('rolls-share-cancel');
        }
        self.$('.js-share-roll').removeClass('js-busy');
      }
    });
  },

  _updateVisibility : function(guideModel, displayState){
    if (displayState == libs.shelbyGT.DisplayState.standardRoll ||
        displayState == libs.shelbyGT.DisplayState.userPersonalRoll) {
      this.$el.show();
    } else {
      // collapse/hide child views
      this._immediateShowHideShareRollView(false);
      this.$el.hide();
    }
  },

  _toggleJoinRoll : function() {
    var self = this;
    var currentRollModel = this.model.get('currentRollModel');
    if ( shelby.models.user.followsRoll(currentRollModel) ){
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
    this._immediateShowHideShareRollView(false);
    // hide join/leave button if the user is the roll's creator (includes the user's public roll)
    if (currentRollModel.get('creator_id') === shelby.models.user.id){
      //this.$('#js-roll-header .js-share-roll').css('width', '137%');
      this.$('#js-roll-header li:last-child').hide();
			this.$('#js-roll-header li:nth-child(2)').show();
    }
    else{
      this.$('#js-roll-header li:last-child').show();
			this.$('#js-roll-header li:nth-child(2)').hide();
    }
    // set text to leave/join roll
    var _buttonText = shelby.models.user.followsRoll(currentRollModel) ? 'Leave' : 'Join';
    this._updateJoinButton(_buttonText);
  },

	_toggleRollEditFunctions : function(){
		var _currentRollModel = this.model.get('currentRollModel');
		if (_currentRollModel.get('creator_id') == shelby.models.user.id){
			var rollName = _currentRollModel.get('title');
			if (this.$('.js-edit-roll').text() == "Edit"){
				this.$('.js-edit-roll').text('Done');
				$('.roll-title-text').hide();
				$('.rolls-list-nav').hide();
				$('#js-roll-name-change').show();
				$('#js-roll-delete').show();
				$('#js-roll-name-change input').focus();
			}
			else {
				var _rollTitle = $('#js-roll-name-change input').val();
				if (_rollTitle !== _currentRollModel.get('title')){
					this._saveRollName(_rollTitle);
				}
				this.$('.js-edit-roll').text('Edit');
				$('.roll-title-text').show();
				$('.rolls-list-nav').show();
				$('#js-roll-name-change').hide();
				$('#js-roll-delete').hide();
			}
		}
	},
	
	_saveRollName : function(newTitle){
		this.model.get('currentRollModel').save({title: newTitle});
	}

});
