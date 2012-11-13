( function(){

  // shorten names of included library prototypes
  var InlineExplorePromoView = libs.shelbyGT.InlineExplorePromoView;
  var PagingListView = libs.shelbyGT.PagingListView;
  var InlineExplorePromoView = libs.shelbyGT.InlineExplorePromoView;
  var InlineRollPromoView = libs.shelbyGT.InlineRollPromoView;
  var InlineDonatePromoView = libs.shelbyGT.InlineDonatePromoView;

  libs.shelbyGT.FrameGroupPlayPagingListView = PagingListView.extend({

    _nextPromoExplore: true,

    frameGroupCollection : null,

    options : _.extend({}, libs.shelbyGT.PagingListView.prototype.options, {
      collapseViewedFrameGroups : true,
      infinite : true,
      listItemViewAdditionalParams : function() {
        return {activationStateModel:shelby.models.guide, guideOverlayModel:shelby.models.guideOverlay};
      },
      noMoreResultsViewProto : InlineExplorePromoView,
      pagingKeySortOrder : -1
    }),

    initialize : function(){
      this.frameGroupCollection = this.options.displayCollection =
        new libs.shelbyGT.FrameGroupsCollection([], {
          collapseViewedFrameGroups : this.options.collapseViewedFrameGroups
        });
      shelby.models.guide.bind('change:activeFrameModel', this._onActiveFrameModelChange, this);
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

    _onActiveFrameModelChange : function(guideModel, activeFrameModel){
      this._loadMoreWhenLastItemActive();
    },

    _loadMoreWhenLastItemActive : function(){
      if (this._loadMoreEnabled) {
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
            headerText : donatePromoInfo.headerText,
            linkSrc : donatePromoInfo.linkSrc,
            model : this.model,
            promoText : donatePromoInfo.promoText,
            thumbnailSrc : donatePromoInfo.thumbnailSrc || libs.shelbyGT.viewHelpers.user.avatarUrlForRoll(this.model)
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
            var rollsCollection = new Backbone.Collection();
            //select one of the promo rolls at random to display in the promo
            rollsCollection.add(promoRolls[Math.floor(Math.random() * (promoRolls.length))]);
            this._nextPromoExplore = true;
            return new InlineRollPromoView({model:rollsCollection});
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