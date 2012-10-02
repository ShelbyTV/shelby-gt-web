libs.shelbyGT.InStreamRollPromoItemView = Support.CompositeView.extend({

  tagName : 'li',

  events : {
    "click .js-goto-roll" : "_goToRoll" 
  },

  template : function(obj){
    return JST['in-stream-roll-promo-item'](obj);
  },

  initialize : function() {
    if (!this.model) {
      var featuredRolls = _(libs.shelbyGT.Onboarding.rolls).reduce(function(memo, category){return memo.concat(category.rolls);}, []);
      this.model = new Backbone.Model(featuredRolls[Math.floor(Math.random() * (featuredRolls.length))]);
    }
  },

  render : function(){
    this.$el.html(this.template({roll:this.model}));
  },

  _goToRoll : function(){
    shelby.router.navigateToRoll(this.model, {trigger:true});
  }

});