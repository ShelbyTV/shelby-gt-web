( function(){

  // shorten names of included library prototypes
  var RollHeaderView = libs.shelbyGT.RollHeaderView;
  var FilterControlsView = libs.shelbyGT.FilterControlsView;
  var AnonGuideView = libs.shelbyGT.AnonGuideView;

  libs.shelbyGT.MenuView = Support.CompositeView.extend({

    events : {
      "click .stream" : "_goToStream",
      "click .rolls" : "_goToRolls",
      "click .saves" : "_goToSaves"
    },

    el : '.menu',

    template : function(obj){
      return JST['menu'](obj);
    },
    
    //maps display states to tab menu tab jquery selectors
    _activeTabSelectorMap : {
      "dashboard" : ".stream",
      "rollList" : ".rolls",
      "standardRoll" : ".rolls",
      "userPersonalRoll" : ".rolls",
      "watchLaterRoll" : ".saves"
    },

    initialize : function(){
      this.model.bind('change:displayState', this._onDisplayStateChange, this);
      this.render();
    },

    render : function(active){
      this.$el.html(this.template());
      this.renderChild(new RollHeaderView({model:this.model}));
      this.renderChild(new FilterControlsView({model:this.model}));
    },

    _goToStream : function(){
      shelby.router.navigate('stream', {trigger:true});
    },

    _goToRolls : function(){
      shelby.router.navigate('rolls', {trigger:true});
    },

    _goToSaves : function(){
      shelby.router.navigate('saves', {trigger:true});
    },

    _onDisplayStateChange : function(guide, newDisplayState){
      this._renderActiveTab(newDisplayState);
    },

    _renderActiveTab : function(displayState){
      var self = this;
      //1. deactivate all (for the case of standardRoll which doesn't have a tab)
      Object.keys(this._activeTabSelectorMap).forEach(function(_displayState){
        self.$(self._activeTabSelectorMap[_displayState]).removeClass('active-tab');
      });
      //2. active displayState
      self.$(self._activeTabSelectorMap[displayState]).addClass('active-tab');
    }

  });

} ) ();
