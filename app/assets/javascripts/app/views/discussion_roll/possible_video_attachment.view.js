/*
 * An individual search result.
 * This gets set as an attachment through its delegates.
 *
 * Currently only supporting YouTube videos, but fairly generic.  Enough so to be extensible with modifications.
 */
libs.shelbyGT.PossibleVideoAttachmentView = libs.shelbyGT.ListItemView.extend({
  
  events: {
    "click .js-add-video"            : "_addVideo",
  },
  
  //no el b/c we are ListViewItem
  
  tagName: 'li',

  className: 'discussion__item discussion__possible-video-attachment-item clearfix',

  initialize : function(){
    //model is raw YT result
    
    this._thumbnail = _.find(this.model.get('media$group').media$thumbnail, function(o){ return o.yt$name === "mqdefault"; });
    this._url = this.model.get('media$group').media$player.url;
  },
  
  template: function(obj){
    return SHELBYJST['discussion-roll/possible-video-attachment'](obj);
  },
  
  render: function(){
    this.$el.html(this.template({
      title: this.model.get('title').$t,
      description: this.model.get('media$group').media$description.$t,
      thumbnail: this._thumbnail
    }));

    libs.shelbyGT.ListItemView.prototype.render.call(this);
  },
  
  _addVideo: function(e){
    e.preventDefault();
    e.stopPropagation();
    
    this.options.delegate.addVideoAttachment({url: this._url, thumbnailUrl: this._thumbnail.url});
  }
  
});