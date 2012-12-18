/*
 * An individual search result.
 * This gets set as an attachment through its delegates.
 *
 * Currently only supporting YouTube videos, but fairly generic.  Enough so to be extensible with modifications.
 */
libs.shelbyGT.PossibleVideoAttachmentView = libs.shelbyGT.ListItemView.extend({
  
  events: {
    "click .js-add-video"           : "_addVideo",
    "click .js-preview-video"       : "_previewVideo"
  },
  
  //no el b/c we are ListViewItem
  
  tagName: 'li',

  className: 'discussion__item clearfix',

  initialize : function(){
    //model is raw YT result    
    this._thumbnail = _.find(this.model.get('media$group').media$thumbnail, function(o){ return o.yt$name === "mqdefault"; });
    this._url = this.model.get('media$group').media$player.url;
    this._ytId = this.model.get('media$group').yt$videoid.$t;
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
  },
  
  _previewVideo: function(e){
    this.$(".js-preview-video").html('<iframe class="discussion__video-preview" src="http://www.youtube.com/embed/'+this._ytId+'?autoplay=1" frameborder="0" allowfullscreen></iframe>');
  }
  
});