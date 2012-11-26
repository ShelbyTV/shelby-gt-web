/*
 * Allows user to search for video, displaying a list of results.
 * The results are rendered as PossibleVideoAttachmentView.  These can be selected and
 * added to our delegate (the reply view)
 *
 * (initially only supports YouTube search directly via YT API)
 */
libs.shelbyGT.DiscussionRollSelectVideoAttachmentView = Support.CompositeView.extend({
  
  events : {
    "click .js-cancel"    : "_destroy",
    "click .js-do-search" : "_doSearch",
  },
  
  //we display on top of everything
  el: "#js-shelby-wrapper",
  
  initialize : function(){
    this.render();    
  },
  
  _cleanup : function(){
  },
  
  template : function(obj){
    return SHELBYJST['discussion-roll/select-video-attachment'](obj);
  },
  
  render : function(){
    this.$el.append(this.template({}));
    //our element should be what we rendered, not the holder we appended into
    this.$el = this.$el.find(".js-discussion-select-video-attachment");
    
    this.$el.find(".js-video-search-query").focus();
  },
  
  _destroy: function(){
    this.leave();
    this.options.delegate.videoAttachmentViewDidDisappear();
  },
  
  _doSearch: function(e){
    var self = this;
    
    e.stopPropagation();
    e.preventDefault();
    
    ytQuery.query({
      "q" : this.$el.find(".js-video-search-query").val(),
      "max-results" : "30",
      "orderby" : "relevance"},
      function(res){
        self.$el.find(".js-possible-video-attachments-list").remove();
        
        var ytVideosCol = new Backbone.Collection();
        
        res.forEach(function(r){
          //make the id the actual string, not an object holding it (or Backbone gets confused)
          r.id = r.id.$t || null;
          ytVideosCol.add(r);
        });

        self.appendChildInto(new libs.shelbyGT.ListView({
          collection: ytVideosCol,
          
          tagName: 'ol',
          className: 'discussion__list discussion__list--attachment-results js-possible-video-attachments-list',
          doStaticRender : true,
          
          listItemView: 'PossibleVideoAttachmentView',
          listItemViewAdditionalParams : { delegate: self }
          
        }), '.js-attachment-content' );

      });
  },
  
  //we act as delegate to PossibleVideoAttachmentView
  //passing the options thru and detroying ourselves
  addVideoAttachment: function(opts){
    this.options.delegate.addVideoAttachment(opts);
    this._destroy();
  }
  
});