libs.shelbyGT.UserPreferencesView = Support.CompositeView.extend({

  events: {
	  "click .js-user-save": 	"_submitContactInfo"
  },
  
  template : function(obj){
    return JST['user-preferences'](obj);
  },

  render : function(){
    this.$el.html(this.template({user:this.model}));
  },

  _submitContactInfo: function(){
	  console.log(this.$('.you-preferences-username').val());
    //this.model.save({primary_email:"henry@sztul.com"});
	},
	
	_toggleWeeklyEmails: function(){
		this.model.save({preferences: {weekly_emails: !this.model.get('preferences').weekly_emails}});
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