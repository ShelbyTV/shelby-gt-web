/*
 * Displays the list of recipients (via children views) whom this discussion roll is with.
 * Does not display the viewing user b/c it's shown as a TO: field.
 */
libs.shelbyGT.DiscussionRollRecipientsView = Support.CompositeView.extend({

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
    
    this.$el.html(this.template());
    
    if(this.model.get('discussion_roll_participants')){ 
      this.model.get('discussion_roll_participants').forEach(function(p){ 
        //show who this is TO (don't include the current viewer in that list)
        if( self.options.viewer !== p ){
          self.appendChildInto(
            new libs.shelbyGT.DiscussionRollRecipientView({model:p, discussionRoll:self.model}),
            '.js-discussion-roll-recipients-list' );
        }
      });
    }
  }
  
});