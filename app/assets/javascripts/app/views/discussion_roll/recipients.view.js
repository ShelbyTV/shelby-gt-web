/*
 * Displays the list of recipients (via children views) whom this discussion roll is with.
 * Does not display the viewing user b/c it's shown as a TO: field.
 */
libs.shelbyGT.DiscussionRollRecipientsView = Support.CompositeView.extend({

  options : _.extend({}, Support.CompositeView.prototype.options, {
    //when we have more than overflowAt recipients, show a "more" link instead of the full list initially
    overflowAt: 4,
    //the recipients for the current page will update the page title
    updatePageTitle: false,
  }),

  events: {
    "click .js-discussion-roll-recipients-toggle-show-all"  : "_toggleShowAllRecipients"
  },
  
  initialize : function(){
    this.model.on('change:discussion_roll_participants', this.render, this);
    this.render();
  },
  
  _cleanup : function(){
    this.model.on('change:discussion_roll_participants', this.render, this);
  },
  
  template : function(obj){
    return SHELBYJST['discussion-roll/recipients'](obj);
  },
  
  render : function(){
    var self = this;
    
    if(this.options.updatePageTitle){
      //page title built iteratively by this and subviews
      document.title = "Shelby Mail with ";
    }
    
    this.$el.html(this.template());
    
    if(this.model.get('discussion_roll_participants')){
      var i = 0;
      
      this.model.get('discussion_roll_participants').forEach(function(p){ 
        //show who this is TO (don't include the current viewer in that list)
        if( self.options.viewer !== p ){
          self.appendChildInto(
            new libs.shelbyGT.DiscussionRollRecipientView({
                  model:p, 
                  discussionRoll:self.model, 
                  overflow:(i>=self.options.overflowAt), 
                  updatePageTitle:self.options.updatePageTitle}),
            self.$('.js-discussion-roll-recipients-list') );
          i++;
        }
      });
      
      if(i>=this.options.overflowAt){
        this.$('.js-discussion-roll-recipients-toggle-show-all').show();
      }
    }

  },
  
  _toggleShowAllRecipients: function(e){
    e.preventDefault();
    
    this.$el.toggleClass("show-all-recipients");
  }
  
});