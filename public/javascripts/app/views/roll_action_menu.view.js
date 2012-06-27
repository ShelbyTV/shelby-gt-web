libs.shelbyGT.RollActionMenuView = Support.CompositeView.extend({

  events : {
    "click #js-rolls-back" : "_goBack",
    "click #js-roll-back" : "_goToPreviousRoll",
    "click #js-roll-next" : "_goToNextRoll",
    "click #js-roll-delete" : "_confirmRollDelete",
    "click .js-share-roll:not(.js-busy)" : "_onShareRoll",
    "click .rolls-add" : "_toggleJoinRoll",
		"click .js-edit-roll" : "_toggleRollEditFunctions"
  },

  el : '#js-roll-action-menu',

  _shareRollView: null,

  _shareRollViewState: null,
  
  _actionCopy: "Share Roll",

  template : function(obj){
    return JST['roll-action-menu'](obj);
  },

  initialize : function(){
    this.model.bind('change', this._onGuideModelChange, this);
    this.model.bind('change:currentRollModel', this._onRollModelChange, this);
    this.options.viewState.bind('change:showEditFunctions', this._onChangeShowEditFunctions, this);
    this._shareRollViewState = new libs.shelbyGT.ShareRollViewStateModel();
    this._shareRollViewState.bind('change:visible', this._onUpdateShareRollViewVisibility, this);
    
    this.render();
  },

  _cleanup : function(){
    this.model.unbind('change', this._onGuideModelChange, this);
    this.model.unbind('change:currentRollModel', this._onRollModelChange, this);
    this.options.viewState.unbind('change:showEditFunctions', this._onChangeShowEditFunctions, this);
    this._shareRollViewState.unbind('change:visible', this._onUpdateShareRollViewVisibility, this);
  },

  render : function(){
    this.$el.html(this.template({actionCopy: this._actionCopy}));
    if (this.model.get('displayState') == libs.shelbyGT.DisplayState.standardRoll &&
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
    // set text to leave/join roll
    var currentRollModel = model.get('currentRollModel');
    if (currentRollModel) {
      var _buttonText = shelby.models.rollFollowings.containsRoll(currentRollModel) ? 'Unfollow' : 'Follow';
      this._updateJoinButton(_buttonText);
    }
    this._updateVisibility();
  },

  _goBack : function(){
    if( window.history && window.history.length > 2 ){
      window.history.back();
    } else {
      shelby.router.navigate("rolls/" + shelby.models.guide.get('rollListContent'), {trigger:true});
    }
  },

  _goToPreviousRoll : function(){
    var previousRoll = shelby.models.rollFollowings.getPreviousRoll(this.model);
    shelby.router.navigateToRoll(previousRoll, {trigger:true,replace:true});
  },

  _goToNextRoll : function(){
    var nextRoll = shelby.models.rollFollowings.getNextRoll(this.model);
    shelby.router.navigateToRoll(nextRoll, {trigger:true,replace:true});
  },
  
  _onShareRoll : function() {
    this._shareRollViewState.toggleVisibility();
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
          this.$('.js-share-roll').text(self._actionCopy).removeClass('rolls-share-cancel');
        }
        self.$('.js-share-roll').removeClass('js-busy');
      }
    });
  },

  _updateVisibility : function(guideModel){
    if (this.model.get('displayState') == libs.shelbyGT.DisplayState.standardRoll &&
        !this.model.get('displayIsolatedRoll')) {
      this.$el.show();
    } else {
      // collapse/hide child views
      this._immediateShowHideShareRollView(false);
      this.options.viewState.set('showEditFunctions', false);
      this.$el.hide();
    }
  },

  _toggleJoinRoll : function() {
    var self = this;
    var currentRollModel = this.model.get('currentRollModel');
    if ( shelby.models.rollFollowings.containsRoll(currentRollModel) ){
      currentRollModel.leaveRoll(function(){
        self._updateJoinButton('Follow');
      });
    }
    else {
      currentRollModel.joinRoll(function(){
        self._updateJoinButton('Unfollow');
      });
    }
  },

  _updateJoinButton : function(action){
    var addOrRemoveClass = action == 'Unfollow' ? 'addClass' : 'removeClass';
    // this.$('.rolls-add').text(action+' Roll')[addOrRemoveClass]('rolls-leave');
    this.$('.rolls-add').text(action)[addOrRemoveClass]('rolls-leave');
  },

  _onRollModelChange : function(guideModel, currentRollModel) {
    this._immediateShowHideShareRollView(false);
    this.options.viewState.set('showEditFunctions', false);
    // hide join/leave button if the user is the roll's creator (includes the user's public roll)
    if (currentRollModel.get('creator_id') === shelby.models.user.id){
      this.$el.find('.js-roll-add-leave-button').hide();
      this.$el.find('.rolls-edit').show();
    }
    else{
      this.$el.find('.js-roll-add-leave-button').show();
      this.$el.find('.rolls-edit').hide();
    }
		
    // set text to leave/join roll
    var _buttonText = shelby.models.rollFollowings.containsRoll(currentRollModel) ? 'Unfollow' : 'Follow';
    this._updateJoinButton(_buttonText);
    
    //update button
    this._actionCopy = this.model.get('currentRollModel').get('public') ? "Share Roll" : "Invite Friends";
    this.$('.js-share-roll').text(this._actionCopy);
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
