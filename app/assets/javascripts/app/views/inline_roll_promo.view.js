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
    this.$el.html(this.template({rolls:this.model}));
    this.model.each(function(roll){
      shelby.track('Show roll promo', {id:roll.id});
    });
  },

  _goToRoll : function(e){
    var rollId = $(e.currentTarget).data('roll_id');
    shelby.router.navigate('roll/' + $(e.currentTarget).data('roll_id'), {trigger:true});
    shelby.track('Click roll promo', {id:rollId});
  }

});