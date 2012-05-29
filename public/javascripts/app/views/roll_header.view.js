libs.shelbyGT.RollHeaderView = Support.CompositeView.extend({

  events : {
    "click #js-rolls-back" : "_goBackToRollsList",
    "click #js-roll-back" : "_goToPreviousRoll",
    "click #js-roll-next" : "_goToNextRoll",
		"keypress #js-roll-name-change input" : "_onEnterInInputArea",
		"click #js-roll-delete" : "_confirmRollDelete"
  },

  className : 'roll-header clearfix',

  template : function(obj){
    return JST['roll-header'](obj);
  },

  initialize : function(){
    this.model.bind('change:title', this.render, this);
  },

  _cleanup : function(){
    this.model.unbind('change:title', this.render, this);
  },

  render : function(){
    this.$el.html(this.template({roll:this.model,guide:shelby.models.guide}));
  },

  _goBackToRollsList : function(){
    shelby.router.navigate("rolls", {trigger:true});
  },

  _goToPreviousRoll : function(){
    var previousRoll = shelby.models.user.getPreviousRoll(this.model);
    shelby.router.navigateToRoll(previousRoll, {trigger:true,replace:true});
  },

  _goToNextRoll : function(){
    var nextRoll = shelby.models.user.getNextRoll(this.model);
    shelby.router.navigateToRoll(nextRoll, {trigger:true,replace:true});
  },

	_showRollNameEditInput : function(){
		if (this.model.get('creator_id') == shelby.models.user.id){
			var rollName = this.model.get('title');
			this.$('#js-roll-name-change').show();
			this.$('.roll-title-text').hide();
			this.$('#js-roll-name-change input').focus();
		}
	},
	
	_onEnterInInputArea : function(){
		if (event.keyCode==13){
			return this._editRollName();
		}
	},
	
	_editRollName : function(){
		var self = this;
		var _newTitle = this.$('.roll-name-change input').val();
    this.model.save({title: _newTitle});
		$('.js-edit-roll').text('Edit');
		$('.roll-title-text').show();
		$('#js-roll-name-change').hide();
	},

	_confirmRollDelete : function(){
		// TODO: when we have a nice ui for confiming things. use that here. GH Issue #200
		if (confirm("Are you sure you want to delete this roll?") === true){
			this._deleteRoll();
		}
	},

	_deleteRoll : function(){
		this.model.destroy({success: function(m,r){
			$('.js-edit-roll').text('Edit');
			shelby.router.navigate('rolls', {trigger:true});
		}});
	}

});
