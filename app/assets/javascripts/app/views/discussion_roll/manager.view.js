/*
 * Gives the user the ability to view and select from their many discussions
 *
 */
libs.shelbyGT.DiscussionRollsManagerView = Support.CompositeView.extend({
  
  el: '#js-discussions-manager',
  
  // Colleciton of all the DiscussionRolls we have access to
  _discussionRolls : null,
  
  initialize : function(){
    var self = this;
    
    var rollsCollection = new libs.shelbyGT.RollsCollectionModel();
    rollsCollection.fetch({
      url: shelby.config.apiRoot + '/discussion_roll',
      data: {token: this.options.token},
      success: function(rollsCollection, resp){
        //RollsCollectionModel doesn't correctly parse this type of response
        self._discussionRolls = new Backbone.Collection(resp.result.rolls);
        self.render();
      }
    });
  },
  
  template : function(obj){
    return SHELBYJST['discussion-roll/manager'](obj);
  },
  
  render : function(){
    var self = this;
    
    this.$el.html(this.template());
    
    if(this._discussionRolls){
      console.log("rendered, _discussionRolls is", this._discussionRolls);
      
      this._discussionRolls.forEach(function(r){
        self.appendChildInto(
          new libs.shelbyGT.DiscussionRollsNavRollView({
            model:r,
            token:self.options.token,
            viewer:self.options.viewer }), 
          '.js-dicussion-rolls-nav' );
      });
    }
  }
  
});

