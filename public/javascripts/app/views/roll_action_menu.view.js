libs.shelbyGT.RollActionMenuView = Support.CompositeView.extend({

  events : {
    "click #js-rolls-back" : "_goBackToRollsList",
    "click #js-roll-back" : "_goToPreviousRoll",
    "click #js-roll-next" : "_goToNextRoll",
    "click #js-roll-delete" : "_confirmRollDelete",
    "click .js-share-roll:not(.js-busy)" : "_onShareRoll",
    "click .rolls-add" : "_toggleJoinRoll",
		"click .js-edit-roll" : "_toggleRollEditFunctions",
		"click #js-add-video" : "_addVideoViaURL"
  },

  el : '#js-roll-action-menu',

  _shareRollView: null,

  _shareRollViewState: null,

  template : function(obj){
    return JST['roll-action-menu'](obj);
  },

  initialize : function(){
    this.model.bind('change:displayState', this._updateVisibility, this);
    this.model.bind('change:currentRollModel', this._updateRollHeaderView, this);
    this._shareRollViewState = new libs.shelbyGT.ShareRollViewStateModel();
    this._shareRollViewState.bind('change:visible', this._onUpdateShareRollViewVisibility, this);
    
    this.render();
  },

  _cleanup : function(){
    this.model.unbind('change:displayState', this._updateVisibility, this);
    this.model.unbind('change:currentRollModel', this._updateRollHeaderView, this);
    this._shareRollViewState.unbind('change:visible', this._onUpdateShareRollViewVisibility, this);
  },

  render : function(){
    this.$el.html(this.template());
    if (this.model.get('displayState') == libs.shelbyGT.DisplayState.standardRoll) {
      this.$el.show();
    }
  },

  _goBackToRollsList : function(){
    shelby.router.navigate("rolls/" + shelby.models.guide.get('rollListContent'), {trigger:true});
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
    // TODO: when we have a nice ui for confiming things. use that here. GH Issue #200
    if (confirm("Are you sure you want to delete this roll?") === true){
      this._deleteRoll();
    }
  },

  _deleteRoll : function(){
    this.model.get('currentRollModel').destroy({success: function(m,r){
      $('.js-edit-roll').text('Edit');
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
          this.$('.js-share-roll').text('Share Roll').removeClass('rolls-share-cancel');
        }
        self.$('.js-share-roll').removeClass('js-busy');
      }
    });
  },

  _updateVisibility : function(guideModel, displayState){
    if (displayState == libs.shelbyGT.DisplayState.standardRoll) {
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
    if ( shelby.models.rollFollowings.containsRoll(currentRollModel) ){
      currentRollModel.leaveRoll(function(){
        self._updateJoinButton('Join');
      });
    }
    else {
      currentRollModel.joinRoll(function(){
        self._updateJoinButton('Leave');
      });
    }
  },

  _updateJoinButton : function(action){
    var addOrRemoveClass = action == 'Leave' ? 'addClass' : 'removeClass';
    // this.$('.rolls-add').text(action+' Roll')[addOrRemoveClass]('rolls-leave');
    this.$('.rolls-add').text(action)[addOrRemoveClass]('rolls-leave');
  },

  _updateRollHeaderView : function(guideModel, currentRollModel) {    
    this._immediateShowHideShareRollView(false);
    // hide join/leave button if the user is the roll's creator (includes the user's public roll)
    if (currentRollModel.get('creator_id') === shelby.models.user.id){
      this.$el.find('.js-roll-add-leave-button').hide();
			this.$el.find('.rolls-edit').show();
    }
    else{
      this.$el.find('.js-roll-add-leave-button').show();
			this.$el.find('.rolls-edit').hide();
    }
		// hide add video area if roll is collaboritive or if user is creator
		if ((currentRollModel.get('creator_id') === shelby.models.user.id) || currentRollModel.get('collaborative')) {
			this.$el.find('#js-roll-add-video-area').show();
		}
		else {
			this.$el.find('#js-roll-add-video-area').hide();
		}
		
    // set text to leave/join roll
    var _buttonText = shelby.models.rollFollowings.containsRoll(currentRollModel) ? 'Leave' : 'Join';
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
				
				if(shelby.models.user.get('public_roll_id') != _currentRollModel.id &&
				    shelby.models.user.get('watch_later_roll_id') != _currentRollModel.id &&
				    shelby.models.user.get('heart_roll_id') != _currentRollModel.id){
				  $('#js-roll-delete').show();
			  }
				
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
	},
	
	_addVideoViaURL : function(){
		var _url = this.$('input#js-video-url-input').val();
		
		// check if url given is valid
		var regex = new RegExp(/^(https?):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i);
		if (regex.test(_url)) {
			var self = this;
			var frame = new libs.shelbyGT.FrameModel();
			frame.save(
				{url: _url, source: 'webapp'},
				{url: shelby.config.apiRoot + '/roll/'+this.model.get('currentRollModel').id+'/frames', 
				wait: true,
				global: false,
				success: function(frame){
					self.model.get('currentRollModel').get('frames').add(frame, {at:0});
					this.$('#js-video-url-input').removeClass('error').attr('placeholder', "yay! your video was added!").val("");
				},
				error: function(a,b,c){
					if (b.status == 404) {
						self._addVideoError("sorry, something went wrong with that one");
					} 
					else { 
						alert("sorry, something went wrong.");
					};
				}
			});
    } else {
			this._addVideoError("that's not a valid url");
    }
	},
	
	_addVideoError: function(message){
		this.$('#js-video-url-input').addClass('error').attr('placeholder', message).val('');
	}

});
