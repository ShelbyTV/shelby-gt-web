/*
 * Displays an invidividual selectable discussion roll so you can get to your other discussion rolls.
 *
 */
libs.shelbyGT.DiscussionRollsNavRollView = Support.CompositeView.extend({
  
  //no el b/c we are rendered by DiscussionRollsManagerView via appendChildInto
  tagName: 'li',

  className: 'discussion__item discussion__item--discussion-roll',

  initialize : function(){
  },
  
  template : function(obj){
    return SHELBYJST['discussion-roll/roll'](obj);
  },
  
  render : function(){
    this.$el.html(this.template({roll:this.model, viewer:this.options.viewer}));
    
    if( this.options.currentRoll && this.model.id===this.options.currentRoll.id ){
      // they're different models; we want to be in sync with the same one used by the convo view
      this.options.currentRoll.set({content_updated_at: this.model.get('content_updated_at')});
      this.model = this.options.currentRoll;
      
      //and mark ourselves as current
      this.$el.addClass("discussion__item--current-discussion-roll");
    }
    
    //re-using the recipients view
    this.renderChildInto(new libs.shelbyGT.DiscussionRollRecipientsView({
                          model:this.model, 
                          viewer:this.options.viewer, 
                          token:this.model.get('token'), 
                          overflowAt:10}), 
                        this.$(".js-discussion-roll-recipients"));
  }
  
});