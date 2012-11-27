/*
 * Displays the list of recipients (via children views) whom this discussion roll is with.
 * Does not display the viewing user b/c it's shown as a TO: field.
 */
libs.shelbyGT.DiscussionRollRecipientsView = Support.CompositeView.extend({

  //when we have more than OVERFLOW_AT recipients, show a "more" link instead of the full list initially
  OVERFLOW_AT: 2,

  events: {
    "click .js-discussion-roll-recipients-toggle-show-all"  : "_toggleShowAllRecipients"
  },
  
  el: '.js-discussion-roll-recipients',
  
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
    
    //page title built iteratively by this and subviews
    document.title = "Shelby Chat with ";
    
    this.$el.html(this.template());
    
    if(this.model.get('discussion_roll_participants')){
      var i = 0;
      
      this.model.get('discussion_roll_participants').forEach(function(p){ 
        //show who this is TO (don't include the current viewer in that list)
        if( self.options.viewer !== p ){
          self.appendChildInto(
            new libs.shelbyGT.DiscussionRollRecipientView({model:p, discussionRoll:self.model, overflow:(i>=self.OVERFLOW_AT)}),
            '.js-discussion-roll-recipients-list' );
          i++;
        }
      });
      
      if(i>=this.OVERFLOW_AT){
        this.$('.js-discussion-roll-recipients-toggle-show-all').show();
      }
    }

  },
  
  _toggleShowAllRecipients: function(e){
    e.preventDefault();
    
    this.$el.toggleClass("show-all-recipients");
  }
  
});