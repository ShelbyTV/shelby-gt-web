libs.shelbyGT.RecThumbnailItemView = libs.shelbyGT.ListItemView.extend({

  options : {
    eventTrackingCategory : 'Frame', // what category events in this view will be tracked under
    actorDescription : 'recommendation' // what type of actor (ie what did they do to this frame) is this? (so far used only for event tracking)
  },

  events : {
    "click .js-rec-thumbnail-link" : "_playVideo"
  },

  initialize : function(){
    this.model.bind('change:thumbnail_url', this.render, this);
  },

  _cleanup : function(){
    this.model.unbind('change:thumbnail_url', this.render, this);
  },

  template : function(obj){
    return SHELBYJST['rec-thumbnail-item'](obj);
  },

  render : function(){
    this.$el.html(this.template({
      actorDescription : this.options.actorDescription,
      video : this.model,
      eventTrackingCategory : this.options.eventTrackingCategory
    }));
    return this;
  },

  _playVideo : function(e) {
      //shelby.router.navigate(this.model.get('nickname'), {trigger:true});
      console.log("supposed to play: ", e);
      e.preventDefault();
  }

});
