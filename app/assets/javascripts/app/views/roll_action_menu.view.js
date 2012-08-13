libs.shelbyGT.RollActionMenuView = Support.CompositeView.extend({

  events : {
    "click #js-rolls-back" : "_goBack",
    "click #js-roll-delete" : "_confirmRollDelete",
    "click .js-roll-add-leave-button" : "_toggleJoinRoll",
		"click .js-edit-roll" : "_toggleRollEditFunctions"
  },

  el : '#js-roll-action-menu',

  template : function(obj){
    return JST['roll-action-menu'](obj);
  },

  initialize : function(){
    this.model.bind('change', this._onGuideModelChange, this);
    this.model.bind('change:currentRollModel', this._onRollModelChange, this);
    this.options.viewState.bind('change:showEditFunctions', this._onChangeShowEditFunctions, this);
    shelby.models.rollFollowings.bind('add:rolls remove:rolls', this._updateJoinButton, this);
  },

  _cleanup : function(){
    this.model.unbind('change', this._onGuideModelChange, this);
    this.model.unbind('change:currentRollModel', this._onRollModelChange, this);
    this.options.viewState.unbind('change:showEditFunctions', this._onChangeShowEditFunctions, this);
    shelby.models.rollFollowings.unbind('add:rolls remove:rolls', this._updateJoinButton, this);
  },

  render : function(){
    this.$el.html(this.template({actionCopy: this._actionCopy}));
    if ((this.model.get('displayState') == libs.shelbyGT.DisplayState.standardRoll || this.model.get('displayState') == libs.shelbyGT.DisplayState.watchLaterRoll) &&
        !this.model.get('displayIsolatedRoll')) {
      this.$el.show();
    }
  },

  _onGuideModelChange : function(model){
    var _changedAttrs = _(model.changedAttributes());
    if (!_changedAttrs.has('displayState') &&
        !_changedAttrs.has('displayIsolatedRoll')) {
      return;
    }
    this._updateJoinButton();
    this._updateVisibility();
  },

  _goBack : function(){
    if( shelby.routeHistory.length > 1 ){
      window.history.back();
    } else {
      shelby.router.navigate("rolls/" + shelby.models.guide.get('rollListContent'), {trigger:true});
    }
  },

  _confirmRollDelete : function(){
		var self = this;
		shelby.confirm("Are you sure you want to permanently delete this roll?", {text: 'Delete Roll', color: 'red'}, {text: 'Cancel'}, function(r){
			if (r == 1){ self._deleteRoll(); }
		});
  },

  _deleteRoll : function(){
    var self = this;
    this.model.get('currentRollModel').destroy({success: function(m,r){
      self.options.viewState.set('showEditFunctions', false);
      shelby.router.navigate('rolls', {trigger:true});
    }});
  },

  _updateVisibility : function(guideModel){
    if ((this.model.get('displayState') == libs.shelbyGT.DisplayState.standardRoll || this.model.get('displayState') == libs.shelbyGT.DisplayState.watchLaterRoll) &&
        !this.model.get('displayIsolatedRoll')) {
      this.$el.show();
    } else {
      // collapse/hide child views
      this.options.viewState.set('showEditFunctions', false);
      this.$el.hide();
    }
  },

  _toggleJoinRoll : function() {
    var self = this;
    var currentRollModel = this.model.get('currentRollModel');
    if ( shelby.models.rollFollowings.containsRoll(currentRollModel) ){
      currentRollModel.leaveRoll();
      // join button updates automatically when rollFollowings changes
      
      shelby.track( 'left_roll',  {id: this.model.id, userName: shelby.models.user.get('nickname')} );
    }
    else {
      currentRollModel.joinRoll();
      // join button updates automatically when rollFollowings changes

      shelby.track('joined_roll', {id: this.model.id, userName: shelby.models.user.get('nickname')});
    }
  },

  _updateJoinButton : function(){
    var currentRollModel = this.model.get('currentRollModel');
    if (!currentRollModel || currentRollModel.get('creator_id') === shelby.models.user.id ||
        !shelby.models.rollFollowings.has('initialized')){
      this.$('.js-roll-add-leave-button').hide();
    } else {
      var action = '';
      if ( shelby.models.rollFollowings.containsRoll(currentRollModel) ){
        action = 'Unfollow';
      } else {
        action = 'Follow';
      }
      var addOrRemoveClass = action == 'Unfollow' ? 'addClass' : 'removeClass';
      this.$('.js-roll-add-leave-button').text(action)[addOrRemoveClass]('rolls-leave');
      this.$('.js-roll-add-leave-button').show();
    }
  },

  _onRollModelChange : function(guideModel, currentRollModel) {
    this.options.viewState.set('showEditFunctions', false);
    // hide join/leave button if the user is the roll's creator (includes the user's public roll)
    if (currentRollModel.get('creator_id') === shelby.models.user.id){
      this.$el.find('.js-roll-add-leave-button').hide();
      //only show roll edit if it's not a special roll
      if(currentRollModel.get('roll_type') < libs.shelbyGT.RollModel.TYPES.all_special_rolls){
        this.$el.find('.js-edit-roll').hide();
      }
      else{
        this.$el.find('.js-edit-roll').show();
      }
    }
    else{
      this.$el.find('.js-roll-add-leave-button').show();
      this.$el.find('.js-edit-roll').hide();
    }
		
    this._updateJoinButton();
  },

  _toggleRollEditFunctions : function() {
    //if we're hiding the edit functions, save changes to the roll name
    if (this.options.viewState.get('showEditFunctions')) {
      var _rollTitle = $('#js-roll-name-change input').val();
      if (_rollTitle !== this.model.get('currentRollModel').get('title')){
        this._saveRollName(_rollTitle);
      }
    }
    this.options.viewState.set('showEditFunctions', !this.options.viewState.get('showEditFunctions'));
  },

  _onChangeShowEditFunctions : function(viewStateModel, showEditFunctions){
    if (showEditFunctions){
      this.$('.js-edit-roll').text('Done');
      $('.roll-title-text').hide();
      $('.rolls-list-nav').hide();
      $('#js-roll-name-change').show();

      var _currentRollModel = this.model.get('currentRollModel');
      if(shelby.models.user.get('public_roll_id') != _currentRollModel.id &&
          shelby.models.user.get('watch_later_roll_id') != _currentRollModel.id &&
          shelby.models.user.get('heart_roll_id') != _currentRollModel.id){
        $('#js-roll-delete').show();
      }

      $('#js-roll-name-change input').focus();
    } else {
      this.$('.js-edit-roll').text('Edit');
      $('.roll-title-text').show();
      $('.rolls-list-nav').show();
      $('#js-roll-name-change').hide();
      $('#js-roll-delete').hide();
    }
  },

  _saveRollName : function(newTitle){
    this.model.get('currentRollModel').save({title: newTitle});
  }
});
