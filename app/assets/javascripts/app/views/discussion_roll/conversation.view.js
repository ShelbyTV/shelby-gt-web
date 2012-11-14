/*
 * Displays the meat of this discussion roll: the actual messages and videos.
 *
 * Since a discussion roll is just a Roll, our view is just an adjusted Roll view....
 *    All of the messages in the conversation are shown
 *    The newest message is at the bottom
 *    There is a "reply" view displayed below this
 *    Most regular shelby actions are not shown
 */
(function(){
  var PagingListView = libs.shelbyGT.PagingListView;
   
  libs.shelbyGT.DiscussionRollConversationView = PagingListView.extend({
  
    tagName: 'ol',
    className: 'js-discussion-roll-conversation-list',
    
    options : _.extend({}, libs.shelbyGT.PagingListView.prototype.options, {
      //model is a discussion roll (set in initialize), it's a collection of frames
      collectionAttribute: 'frames',
      
      //which we render as...
      listItemView: 'DiscussionRollFrameView', //<-- we pass this view some additional info, see initialize()
      
      //and order with the oldest on top...
      comparator: function(frame){ return frame.id; },
      
      //also need to tell PagingListView about our reversed order
      pagingKeySortOrder: -1,
      
      //and allow it to pull in 10 at a time
      limit: 10,
    }),
  
    initialize : function(){
      this.options.listItemViewAdditionalParams = { viewer: this.options.viewer };
      
      PagingListView.prototype.initialize.call(this);
    },
    
    _doesResponseContainListCollection : function(response) {
      return response.result && $.isArray(response.result.frames);
    }
  
  });
  
}) ();