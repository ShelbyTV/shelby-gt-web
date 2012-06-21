libs.shelbyGT.UserPreferencesView = Support.CompositeView.extend({

  events: {
	  "click .js-user-save": 	"_submitContactInfo",
		"click .js-user-cancel": "_cancel",
		"change #you-preferences-email-weekly": "_toggleWeeklyEmails",
		"change #you-preferences-email-watches": "_toggleWatchEmails",
		"change #you-preferences-email-upvotes": "_toggleUpvoteEmails",
		"change #you-preferences-email-comments": "_toggleCommentEmails",
		"change #you-preferences-email-rerolls": "_toggleRerollEmails",
		"change #you-preferences-email-joinrolls": "_toggleJoinrollEmails"
  },
  
  template : function(obj){
    return JST['user-preferences'](obj);
  },

  render : function(){
    this.$el.html(this.template({user:this.model}));
  },

	_cancel: function(){
		//TODO: what should cancel really do?
		// -1 (or .back) seems to bring us to the wrong place.
		window.history.back();
	},

  _submitContactInfo: function(){
		var self = this;
		var _email = this.$('#you-preferences-email').val();
		var _username = this.$('#you-preferences-username').val();
		var info = {primary_email: _email, nickname: _username};
    this.model.save(info, {
			success: function(model, resp){self._updateResponse(resp, "saved!");},
			error: function(model, resp){
				var message = JSON.parse(resp.responseText).message;
				if (message === "error while updating user: Validation failed: Primary email is invalid"){
					self._updateResponse(resp, "email not valid.");
				}
				else if (message === "error while updating user: Validation failed: Nickname has already been taken"){
					self._updateResponse(resp, "nickname is taken.");
				}
				else {
					self._updateResponse(resp, "error");
				}
			}
    });
	},
	
	_updateResponse: function(resp, msg){
		var self = this;
   	this.$('.js-response-message').show().text(msg);
		setTimeout(function(){
			self.$('.js-response-message').fadeOut('fast', function() { $(this).text(""); });
		}, 3000);
	},
	
	_toggleWeeklyEmails: function(){
		var _prefs = this.model.get('preferences');
		_prefs.email_updates = this.$('#you-preferences-email-weekly').is(':checked') ? true : false;
		this.model.save({preferences: _prefs});
	},
  
	_toggleCommentEmails: function(){
		var _prefs = this.model.get('preferences');
		_prefs.comment_notifications = this.$('#you-preferences-email-comments').is(':checked') ? true : false;
		this.model.save({preferences: _prefs});
	},
	
	_toggleUpvoteEmails: function(){
		var _prefs = this.model.get('preferences');
		_prefs.upvote_notifications = this.$('#you-preferences-email-upvotes').is(':checked') ? true : false;
		this.model.save({preferences: _prefs});
	},
	
	_toggleWatchEmails: function(){
		var _prefs = this.model.get('preferences');
		_prefs.watched_notifications = this.$('#you-preferences-email-watches').is(':checked') ? true : false;
		this.model.save({preferences: _prefs});
	},

	_toggleRerollEmails: function(){
		var _prefs = this.model.get('preferences');
		_prefs.reroll_notifications = this.$('#you-preferences-email-rerolls').is(':checked') ? true : false;
		this.model.save({preferences: _prefs});
	},
	
	_toggleJoinrollEmails: function(){
		var _prefs = this.model.get('preferences');
		_prefs.roll_activity_notifications = this.$('#you-preferences-email-joinrolls').is(':checked') ? true : false;
		this.model.save({preferences: _prefs});		
	}

  // the future
  
});