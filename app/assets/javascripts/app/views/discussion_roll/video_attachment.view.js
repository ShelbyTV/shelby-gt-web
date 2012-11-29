/*
 * An attached video, to be sent with next message
 */
libs.shelbyGT.DiscussionRollVideoAttachmentView = libs.shelbyGT.ListItemView.extend({
  
  events : {
    "click .js-remove"    : "_destroy"
  },
  
  className: 'discussion__item discussion__item--attachment clearfix',
  
  //don't need an el, we get appended
  
  initialize: function(){
  },
  
  _cleanup: function(){
  },
  
  _destroy: function(){
    this.leave();
  },
  
  template: function(obj){
    return SHELBYJST['discussion-roll/video-attachment'](obj);
  },
  
  render: function(){
    this.$el.html(this.template({thumbnailUrl: this.options.thumbnailUrl}));
  }
  
});