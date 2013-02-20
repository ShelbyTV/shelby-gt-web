/*
 * Full app width header used when displaying iso rolls.
 *
 * Handles switching between multiple rolls on supported accounts.
 */
libs.shelbyGT.IsoRollAppHeaderView = Support.CompositeView.extend({

  events : {
    "click .js-change-iso-roll"             : "_onChangeRoll",
    "click .js-subscribe-button"            : "_onSubscribe",
    "click .js-follow-button:not(.js-busy)" : "_onFollowOrUnfollow",
    "click .js-full-shelby-button"          : "_onFullShelby"
  },

  // all rolls of this multi-iso-roll the viewer can navigate to
  _associatedRolls: null,
  _currentRoll: null,

  el: '#js-iso-roll-header',

  template: function(obj){
      return SHELBYJST['iso-roll-app-header'](obj);
  },

  initialize: function(){
    this.options.guide.on('change:currentRollModel', this._onNewCurrentRollModel, this);
    this.options.rollFollowings.on('change:initialized', this._onRollFollowingsInitialized, this);
  },

  _cleanup: function(){
    this.options.guide.off('change:currentRollModel', this._onChangeCurrentRollModel);
    this.options.rollFollowings.off('change:initialized', this._onRollFollowingsInitialized, this);
  },

  render: function(){
    this.$el.removeAttr('hidden');

    if(this._currentRoll){
      this.$el.html(this.template({
        currentRoll: this._currentRoll,
        associatedRolls: this._associatedRolls
      }));

      this._updateFollowButton();
    }
  },

  _onNewCurrentRollModel: function(guideModel, currentRollModel){
    currentRollModel.on('change', this._onChangeCurrentRollModel, this);
    this._currentRoll = currentRollModel;
    this.render();
  },

  _onChangeCurrentRollModel: function(){
    var self = this;

    this._currentRoll = this.options.guide.get('currentRollModel');

    if( !this._associatedRolls ){
      var rollsCollection = new libs.shelbyGT.RollsCollectionModel();
      rollsCollection.fetch({
        url: shelby.config.apiRoot + '/roll/' + this._currentRoll.id + '/associated',
        success: function(rollsCollection, resp){
          //RollsCollectionModel doesn't correctly parse this type of response
          self._associatedRolls = new Backbone.Collection(resp.result.rolls);
          self.render();
        }
      });
    } else {
      this.render();
    }
  },

  _onChangeRoll: function(e){
    e.preventDefault();
    var selectedRollId = $(e.currentTarget).data('roll_id');
    shelby.router.navigate('/isolated-roll/'+selectedRollId, {trigger:true});
    shelby.models.userDesires.set({guideShown: true});
  },

  _onFollowOrUnfollow : function() {
     var $thisButton = this.$('.js-follow-button');
     // immediately toggle the button - if the ajax fails, we'll update the next time we render
     var isFollow = $thisButton.toggleClass('button-active').hasClass('button-active');
     var wasFollow = !isFollow;
     // even though the inverse action is now described by the button, we prevent click handling
     // with class js-busy until the ajax completes
     $thisButton.text(isFollow ? 'Follow' : 'Unfollow').addClass('js-busy');

     // now that we've told the user that their action has succeeded, let's fire off the ajax to
     // actually do what they want, which will very likely succeed
     var clearBusyFunction = function() {
       $thisButton.removeClass('js-busy');
     };
     if (wasFollow) {
       this._currentRoll.joinRoll(clearBusyFunction, clearBusyFunction);
     } else {
       this._currentRoll.leaveRoll(clearBusyFunction, clearBusyFunction);
     }
   },
   
   _onSubscribe: function(){
     var href = "/subscribe-via-email/roll/"+this._currentRoll.id+"?roll_title="+this._currentRoll.get('title')+"&curator="+this._currentRoll.get('creator_nickname'),
     width = 700,
     height = 500,
     left = (screen.width/2)-(width/2),
     top = (screen.height/2)-(height/2);
     window.open(href,
        "subscribePopup", 
        "menubar=no,toolbar=no,status=no,width="+width+",height="+height+",toolbar=no,left="+left+",top="+top);

     shelby.trackEx({
       providers : ['ga'],
       gaCategory : 'Header',
       gaAction : 'subscribe-via-email-click',
       gaLabel : shelby.models.user.get('nickname')});
     return false;
   },

   _onFullShelby : function() {
     if (!shelby.models.user.get('anon')) {
       window.top.location.href = shelby.config.appUrl + '/roll/' + this._currentRoll.id;
     } else {
       window.top.location.href = shelby.config.appUrl;
     }
   },

   _updateFollowButton : function() {
     if (libs.shelbyGT.viewHelpers.roll.isFaux(this._currentRoll)){
       this.$('.js-follow-button').hide();
     } else if (this._currentRoll.get('creator_id') === shelby.models.user.id ||
                !shelby.models.rollFollowings.has('initialized')){
       this.$('.js-follow-button').hide();
     } else {
       var userFollowingRoll = shelby.models.rollFollowings.containsRoll(this._currentRoll);
       this.$('.js-follow-button').toggleClass('button-active', !userFollowingRoll)
         .text(userFollowingRoll ? 'Unfollow' : 'Follow').show();
     }
   },

   _onRollFollowingsInitialized : function(rollFollowingsModel, initialized) {
     if (initialized) {
       this._updateFollowButton();
     }
   }

});
