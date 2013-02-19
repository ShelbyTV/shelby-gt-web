/*
 * Displays the most recent message from the given roll.
 *
 */
libs.shelbyGT.DiscussionRollLastMessageView = Support.CompositeView.extend({
  
  initialize: function(){
    this._fetchMessage();
  },
  
  template: function(obj){
    return SHELBYJST['discussion-roll/last-message'](obj);
  },
  
  render: function(){    
    if(this._frame && this._frame.get('conversation')){
      var caption = null;
      
      //1) loop through messages in reverse order, if we find text, use that
      var messages = this._frame.get('conversation').get('messages');
      messages.toArray().reverse().forEach(function(m){
        if(caption == null && m.has('text') && m.get('text').length > 0){
          caption = m.escape('text');
        }
      });
      
      //2) if no message text, use the title of the video
      if(caption == null){
        caption = this._frame.get('video').get('title');
      }
      
      this.$el.html(this.template({msg:caption}));
    }
  },
  
  _fetchMessage: function(){
    var self = this;
    //the model given to us is a regular BackboneModel, need to make a DiscussionRollModel out of it
    var dr = new libs.shelbyGT.DiscussionRollModel({id:this.model.id, token:this.model.get('token')});
    dr.fetch({
      data: {limit:1},
      success: function(roll, resp){
        if(resp.status == 200){
          self._frame = roll.get('frames') && roll.get('frames').at(0);
          self.render(); 
        }
      }
    });
  }
  
});