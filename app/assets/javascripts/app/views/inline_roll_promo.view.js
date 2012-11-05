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
    // var headerText = 'Discover even more great content';
    var headerText = 'See video of the storm and donate to the Red Cross';
    this.$el.html(this.template({
      rolls : this.model,
      headerText : headerText
    }));
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