( function(){

  // shorten names of included library prototypes
  var FrameGroupPlayPagingListView = libs.shelbyGT.FrameGroupPlayPagingListView;
  var InlineExplorePromoView = libs.shelbyGT.InlineExplorePromoView;

  libs.shelbyGT.MultiplexedVideoView = FrameGroupPlayPagingListView.extend({

    className : FrameGroupPlayPagingListView.prototype.className + ' roll',

    options : _.extend({}, FrameGroupPlayPagingListView.prototype.options, {
      listItemView : 'FrameGroupView',
      fetchParams : {
        include_children : true
      }
    }),

    initialize : function(){
      FrameGroupPlayPagingListView.prototype.initialize.call(this);

      // TODO: bind change:channel to call _changeChannel

      this.options.multiplexedVideoModel.bind("channel", this._changeChannel, this);
    },

    _cleanup : function(){
      FrameGroupPlayPagingListView.prototype._cleanup.call(this);
      this.options.multiplexedVideoModel.unbind("channel", this._changeChannel, this);
    },

    render : function(){
      FrameGroupPlayPagingListView.prototype.render.call(this);
      if (this.options.multiplexedVideoModel.get('channel')) {
        shelby.router.navigate('channel/' + this.options.multiplexedVideoModel.get('channel'), {trigger: false, replace: true});
      }
      $('.channel_info__wrapper').show();
    },

    _changeChannel : function(){
      if (this.options.multiplexedVideoModel.get('channel')) {
        this.collection.reset();
        var rollIds = shelby.config.multiplexedVideoRolls[this.options.multiplexedVideoModel.get('channel')];
        var rollModel;
        var self = this;
        self._check = 0;
        rollIds.forEach(function(id){
          // create and get the roll model w/frames
          rollModel = new libs.shelbyGT.RollModel({id: id});
          rollModel.fetch({
            success : function(model, response){
              // add the frames to a master collection
              shelby.collections.multiplexedVideoFrames.add(model.get('frames').models).sort();
              //if nothing is already playing, start playing the first video in the search results
              self._check += 1;
              if (self._check == (rollIds.length)) {
                // don't want to activate the video if we've switched to explore view during the asynchronous load
                if (shelby.models.guide.get('displayState') != libs.shelbyGT.DisplayState.explore) {
                  var firstFrame = shelby.collections.multiplexedVideoFrames.first();
                  if (firstFrame) {
                    shelby.models.guide.set('activeFrameModel', firstFrame);
                  }
                }
              }
            }
          });
        });
      }
    },

    _doesResponseContainListCollection : function(response) {
      return response.result.frames;
    },

    // TODO: take a look at this when promos are work for lists that are not sorted by natural order.

    // FrameGroupPlayPagingListView overrides
    _filterPromoRolls : function(roll) {
      //don't show a promo for the roll that you're currently looking at
      // return (roll.has('id') && roll.id != this.model.id && roll.has('display_title') && roll.has('display_thumbnail_src'));
      //TEMPRORARY ITS OK TO SHOW BECAUSE IT WILL BE A DONATE PROMO
      return (roll.has('id') && roll.has('display_title') && roll.has('display_thumbnail_src'));
    },

    _lookupDonatePromo : function() {
      return null;
    }

  });

} ) ();
