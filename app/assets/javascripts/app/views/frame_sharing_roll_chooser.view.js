/*
 * Shows a list of all this users accessible discussion rolls.
 *
 * Hides the input when a previous roll is chosen.
 *
 * Relies on parent (ShareFrameView) being smart about the share.
 *
 */
libs.shelbyGT.FrameSharingRollChooserView = Support.CompositeView.extend({
  
  events : {
    "change #js-discussion-roll-chooser"  : "_optionSelected"
  },

  template : function(obj){
    return SHELBYJST['frame-sharing-roll-chooser'](obj);
  },
  
  initialize: function(){
    var self = this;
    
    var rollsCollection = new libs.shelbyGT.RollsCollectionModel();
    rollsCollection.fetch({
      url: shelby.config.apiRoot + '/discussion_roll',
      success: function(rollsCollection, resp){
        //RollsCollectionModel doesn't correctly parse this type of response
        self._discussionRolls = new Backbone.Collection(resp.result.rolls);
        self.render();
      }
    });
  },

  render : function(){
    if(this._discussionRolls && this._discussionRolls.size() > 0){
      this.$el.html(this.template({discussionRolls:this._discussionRolls}));
    }
  },
  
  _optionSelected: function(e){
    var selected = this.$("option:selected");
    if( selected.hasClass("js-new-chat-option") ){
      this.options.input.show();
    } else {
      this.options.input.hide();
    }
  }
  
});