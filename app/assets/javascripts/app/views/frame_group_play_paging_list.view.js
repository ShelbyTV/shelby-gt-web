( function(){

  // shorten names of included library prototypes
  var InlineExplorePromoView = libs.shelbyGT.InlineExplorePromoView;
  var PagingListView = libs.shelbyGT.PagingListView;
  var InlineRollPromoView = libs.shelbyGT.InlineRollPromoView;
  var InlineDonatePromoView = libs.shelbyGT.InlineDonatePromoView;
  var FrameGroupsCollection = libs.shelbyGT.FrameGroupsCollection;
  var PlaylistType = libs.shelbyGT.PlaylistType;

  libs.shelbyGT.FrameGroupPlayPagingListView = PagingListView.extend({

    events : function() {
      // we're going to handle the process of clicking on a frame and activating it from here
      // because the parent list view has more context to be able to perform all the necessary
      // operations, particularly a reference to the collection which will become the
      // new active playlist as a result of the frame activation
      var events = {};
      // events["click ." + this.options.frameActivateCommandClass] = "_activateFrame";
      return _(events).extend(PagingListView.prototype.events.call(this));
    },

    _nextPromoExplore: true,

    frameGroupCollection : null,

    options : _.extend({}, PagingListView.prototype.options, {
      collapseViewedFrameGroups : true,
      mobileVideoFilter : function(frame) {
          return frame.get('video').canPlayMobile();
      },
      infinite : true,
      listItemViewAdditionalParams : function(parentListView) {
        return {
          activationStateModel : shelby.models.guide,
          guideOverlayModel : shelby.models.guideOverlay,
          playlistFrameGroupCollection : parentListView.frameGroupCollection,
          playlistManagerModel : shelby.models.playlistManager,
          playlistType : this.playlistType
        };
      },
      noMoreResultsViewProto : InlineExplorePromoView,
      pagingKeySortOrder : -1,
      playlistType : PlaylistType.dashboard
    }),

    initialize : function(){
      this.frameGroupCollection = this.options.displayCollection =
        new FrameGroupsCollection([], {
          collapseViewedFrameGroups : this.options.collapseViewedFrameGroups
        });

      // if (Browser.isMobile()) {
      var flashVersion = swfobject.getFlashPlayerVersion();
      if ( flashVersion.major == 0 ) {
        this._filter = this.options.mobileVideoFilter;
      }

      shelby.models.guide.bind('change:activeFrameModel', this._onActiveFrameModelChange, this);

      this._checkAndRegisterPlaylist();

      PagingListView.prototype.initialize.call(this);
    },

    _cleanup : function(){
      this.frameGroupCollection._cleanup();
      shelby.models.guide.unbind('change:activeFrameModel', this._onActiveFrameModelChange, this);
      PagingListView.prototype._cleanup.call(this);
    },

    render : function(forceReRender){
      PagingListView.prototype.render.call(this, forceReRender);
      this._loadMoreWhenLastItemActive();
    },

    _checkAndRegisterPlaylist : function() {
      // if nothing's currently playing,
      // register our frame group collection as the current playlist so we can start playing from it if desired
      // REMEMBER: we don't do this if something is already playing, because in shelby,
      // once a playlist is playing, we don't switch until the user actively decides to play something new,
      var isAnythingPlaying = shelby.models.guide.get('activeFrameModel');
      // UNLESS: we override this by setting shelby.models.routingState.forceFramePlay to true
      // doing so means that for as long as this property is true, any playlist that is loaded
      // will automatically become the currently playing playlist
      var forceFramePlay = shelby.models.routingState.get('forceFramePlay');
      // if we're playing a roll or the dashboard, and we remove its view from the screen, we rely on
      // a leftover reference to its playlist to continue choosing what to play
      // the contents of that playlist can get out of date, so if we bring up that roll or dashboard's view again
      // and reload its contents while we're still playing it, we need to now use the contents of that new playlist
      var returningToDashboard = this.options.playlistType == PlaylistType.dashboard &&
        shelby.models.playlistManager.get('playlistType') == PlaylistType.dashboard;
      var returningToRoll = this.options.playlistType == PlaylistType.roll &&
        shelby.models.playlistManager.get('playlistType') == PlaylistType.roll &&
        shelby.models.playlistManager.get('playlistRollId') == this.model.id;
      var reloadingCurrentPlaylist = returningToDashboard || returningToRoll;
      var viewingChannel = this.options.playlistType == PlaylistType.channel;

      if (!isAnythingPlaying || forceFramePlay || reloadingCurrentPlaylist || viewingChannel) {
        this._registerPlaylist();
      }

    },

    registerPlaylist : function() {
      shelby.models.playlistManager.set({
        playlistFrameGroupCollection : this.frameGroupCollection,
        playlistType : this.options.playlistType,
        playlistRollId : this.options.playlistType == PlaylistType.roll ? this.model.id : null
      });
    },

    _onActiveFrameModelChange : function(guideModel, activeFrameModel){
      this._loadMoreWhenLastItemActive();
    },

    _loadMoreWhenLastItemActive : function(){
      if (this._loadMoreEnabled && this.options.infinite) {
        var activeFrameModel = shelby.models.guide.get('activeFrameModel');
        if (activeFrameModel) {
          // if we're playing the final playable frame group in the list, load some more if they are available
          // so they're ready to go when this frame finishes
          if (this.frameGroupCollection.isLastPlayableFrameGroup(activeFrameModel)) {
              this._loadMore();
          }
        }
      }
    },

    _onItemsLoaded : function(rollModel, items){
      PagingListView.prototype._onItemsLoaded.call(this, rollModel, items);
      this._loadMoreWhenLastItemActive();
    },

    //ListView overrides
    _intervalInsertViews : function() {
      // TEMPORARILY PROMOING ONLY ROLLS TO SEE IF WE GET SOME JUICE FROME FRANKENSTORM

      //we'll just randomly choose to show a promo for the explore section or for a specific roll
      // if (this._nextPromoExplore) {
      //   this._nextPromoExplore = false;
      //   return new InlineExplorePromoView();
      // } else {
        var donatePromoInfo = this._lookupDonatePromo();
        if (donatePromoInfo) {
        // render a donate promo if the current roll is set to do so
          return new InlineDonatePromoView({
            model: this.model,
            promoAvatarSrc : donatePromoInfo.promoAvatarSrc || libs.shelbyGT.viewHelpers.user.avatarUrlForRoll(this.model),
            promoLinkSrc : donatePromoInfo.promoLinkSrc,
            promoMessage : donatePromoInfo.promoMessage,
            promoTitle : donatePromoInfo.promoTitle,
            promoThumbnailSrc : donatePromoInfo.promoThumbnailSrc
          });
        } else {
          // if there are no special settings for this roll, render a roll promo
          var promoRolls =
            shelby.models.promoRollCategories.get('roll_categories').reduce(function(memo, category){
              return memo.concat(category.get('rolls').models);
            }, []);
          //only consider rolls that have all the needed attribtues to render a promo
          promoRolls = promoRolls.filter(this._filterPromoRolls, this);
          if (promoRolls.length) {
            //select one of the promo rolls at random to display in the promo
            var rollToPromo = promoRolls[Math.floor(Math.random() * (promoRolls.length))];
            this._nextPromoExplore = true;
            return new InlineRollPromoView({
              model: rollToPromo,
              promoAvatarSrc: rollToPromo.get('in_line_avatar_src') || rollToPromo.get('display_thumbnail_src'),
              promoMessage: rollToPromo.get('in_line_promo_message') || 'Check out more great video on this roll',
              promoTitle: rollToPromo.get('in_line_promo_title') || rollToPromo.get('display_title'),
              promoThumbnailSrc: rollToPromo.get('in_line_thumbnail_src') || rollToPromo.get('display_thumbnail_src')
            });
          } else {
            //TEMPORARILY PROMO NOTHING IF WE HAVE NO ROLLS TO PROMO
            return [];
            // this._nextPromoExplore = false;
            //we don't have any rolls to promo, so promo explore instead
            // return new InlineExplorePromoView();
          }
        }
      // }
    },

    _filterPromoRolls : function(roll) {
      return (roll.has('id') && roll.has('display_title') && roll.has('display_thumbnail_src'));
    },

    _lookupDonatePromo : function() {
      return null;
    }

  });

} ) ();
