libs.shelbyGT.RollFilterControlsView = Support.CompositeView.extend({

  events : {
    "click #js-rolls-back" : "_goBackToRollsList",
    "click #js-roll-back" : "_goToPreviousRoll",
    "click #js-roll-next" : "_goToNextRoll",
		"click .js-roll-title-text" : "_showRollNameEditInput",
		"focusout .js-roll-name-change" : "_closeInputArea",
		"keypress .js-roll-name-change" : "_onEnterInInputArea"
  },

  tagName : 'div',

  className : 'filter clearfix',

  template : function(obj){
    return JST['roll-filter-controls'](obj);
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
			this.$('.js-roll-title-text').replaceWith('<input class="js-roll-name-change" value="'+rollName+'"/ size="15">');
			this.$('input.js-roll-name-change').focus();
		}
	},
	
	_onEnterInInputArea : function(){
		if (event.keyCode==13){
			return this._editRollName();
		}
	},
	
	_editRollName : function(){
		var self = this;
		var _newTitle = this.$('.js-roll-name-change').val();
    this.model.save({title: _newTitle});
	},
	
	_closeInputArea : function(){
		this.$('input.js-roll-name-change').replaceWith('<span class="js-roll-title-text">'+this.model.get('title')+'</span>');
	}

});