/*
 * Gives the user the ability to view and select from their many discussions
 *
 */
libs.shelbyGT.DiscussionRollsManagerView = Support.CompositeView.extend({

  events : {
    "click .dicussion_menu__item--current-discussion-roll"  : "_disappear",
    "click .js-about"           : "_showExplanation",
    "click .explanation__dismiss"           : "_dimissExplanation"
  },

  el: '#js-discussions-manager',

  // Collection of all the DiscussionRolls we have access to
  _discussionRolls : null,

  initialize : function(){
    if(this.model){ this.model.on('change:content_updated_at', this._fetchRolls, this); }

    this._fetchRolls();
  },

  _cleanup: function(){
    if(this.model){ this.model.off('change:content_updated_at', this._fetchRolls); }
  },

  _fetchRolls: function(){
    var
    self = this,
    rollsCollection = new libs.shelbyGT.RollsCollectionModel();

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
      this._discussionRolls.toArray().reverse().forEach(function(r){
        self.appendChildInto(
          new libs.shelbyGT.DiscussionRollsNavRollView({
            currentRoll:self.model,
            model:r,
            token:self.options.token,
            viewer:self.options.viewer }),
          '.js-dicussion-rolls-nav' );
      });
      if(this._discussionRolls.length === 0){
        this._showExplanation();
        this.$('.explanation__dismiss').hide();
        this.$('.explanation__present').hide();
      }
    }
  },

  _disappear : function(e){
    e.stopPropagation();
    e.preventDefault();

    this.options.delegate.discussionRollsManagerViewShouldDisappear();
  },

  _showExplanation: function(){
    this.$(".js-about-content").show();
  },

  _dimissExplanation: function(){
    this.$(".js-about-content").hide();
  }

});

