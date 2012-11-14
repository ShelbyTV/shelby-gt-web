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
      //model is a discussion roll (set in initialize), it holds a bunch of frames
      collectionAttribute: 'frames',
      
      //which we render as...
      listItemView: 'DiscussionRollFrameView', //<-- we pass this view some additional info, see initialize()
      
      //order them with the oldest on top (API sends newest first)
      insert : {
        position : 'prepend'
      },
    }),
  
    initialize : function(){
      this.options.listItemViewAdditionalParams = { viewer: this.options.viewer };
      
      PagingListView.prototype.initialize.call(this);
    }
  
  });
  
}) ();