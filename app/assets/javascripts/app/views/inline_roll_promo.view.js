libs.shelbyGT.InlineRollPromoView = Support.CompositeView.extend({

  tagName : 'li',

  events : {
    "click .js-goto-roll" : "_goToRoll"
  },

  template : function(obj){
    return SHELBYJST['inline-roll-promo'](obj);
  },

  //NOTE: expecting this.model to be a Backbone.Collection of rolls passed in to constructor
  render : function(){
    var headerText;
    var roll;
    if (shelby.models.user.isAnonymous()) {
      headerText = 'See video of the storm and donate to the Red Cross';
      roll = this.model.at(0);
      var avatarSrc = roll.get('in_line_thumbnail_src') || roll.get('display_thumbnail_src');
      this.$el.html(SHELBYJST['inline-sandy-promo']({
        avatarSrc : avatarSrc,
        headerText : headerText,
        promoText : 'sandy.shelby.tv',
        roll : roll
      }));
    } else {
      headerText = 'View our latest Hashtag Roll';
      roll = this.model.at(0);
      this.$el.html(SHELBYJST['inline-sandy-promo']({
        avatarSrc : 'http://s3.amazonaws.com/shelby-gt-user-avatars/sq48x48/5096790db415cc05a2006f5b',
        headerText : headerText,
        promoText : '#HurricaneSandy',
        roll : roll
      }));
    }

    this.model.each(function(roll){
      shelby.track('Show roll promo', {id:roll.id});
    });
  },

  _goToRoll : function(e){
    var rollId = $(e.currentTarget).data('roll_id');
    if (shelby.models.guide.get('displayIsolatedRoll')) {
      window.top.location.href = shelby.config.appUrl + '/roll/' + rollId;
    } else {
      shelby.router.navigate('roll/' + rollId, {trigger:true});
    }
    shelby.track('Click roll promo', {id:rollId});
  }

});