libs.shelbyGT.UserPreferencesView = Support.CompositeView.extend({
  
  preferences: this.model.get('preferences'),

  events: {
	  "click .updateEmail": 	"_submitContactInfo"
  },
  
  template : function(obj){
    return JST['user-preferences'](obj);
  },

  render : function(){
    this.$el.html(this.template({user:this.model}));
  },

  _submitContactInfo: function(){
    //this.model.save({primary_email:"henry@sztul.com"});
	},
	
	_toggleWeeklyEmails: function(){
		this.model.save({preferences: {weekly_emails: !this.preferences.weekly_emails}});
	},
  
	_toggleCommentEmails: function(){
		this.model.save({preferences: {comment_emails: !this.preferences.comment_emails}});
	},
	
	_toggleUpvoteEmails: function(){
		this.model.save({preferences: {upvote_emails: !this.preferences.upvote_emails}});
	},
	
	_toggleRerollEmails: function(){
		this.model.save({preferences: {reroll_emails: !this.preferences.reroll_emails}});
	}

  // the future
  
});