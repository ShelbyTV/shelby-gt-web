libs.shelbyGT.UserPreferencesView = Support.CompositeView.extend({

  events: {
	  "click .js-user-save": 	"_submitContactInfo",
		"click .js-user-cancel": "_cancel",
		"change #you-preferences-email-weekly": "_toggleWeeklyEmails"
  },
  
  template : function(obj){
    return JST['user-preferences'](obj);
  },

  render : function(){
    this.$el.html(this.template({user:this.model}));
  },

	_cancel: function(){
		window.history.go(-2);
	},

  _submitContactInfo: function(){
		var self = this;
		var _email = this.$('#you-preferences-email').val();
		var _username = this.$('#you-preferences-username').val();
		var info = {primary_email: _email, nickname: _username};
    this.model.save(info, {
			success: function(){self._responseMessage("saved!");},
			error: function(){self._responseMessage("error");}
    });
	},
	
	_responseMessage: function(msg){
		var self = this;
   	this.$('.js-response-message').show().text(msg);
		setTimeout(function(){
			self.$('.js-response-message').fadeOut('fast', function() { $(this).text(""); });
		}, 3000);
	},
	
	_toggleWeeklyEmails: function(){
		var _val = this.$('#you-preferences-email-weekly').is(':checked') ? true : false;
		this.model.save({preferences: {weekly_emails: _val}});
	},
  
	_toggleCommentEmails: function(){
		this.model.save({preferences: {comment_emails: !this.model.get('preferences').comment_emails}});
	},
	
	_toggleUpvoteEmails: function(){
		this.model.save({preferences: {upvote_emails: !this.model.get('preferences').upvote_emails}});
	},
	
	_toggleRerollEmails: function(){
		this.model.save({preferences: {reroll_emails: !this.model.get('preferences').reroll_emails}});
	}

  // the future
  
});