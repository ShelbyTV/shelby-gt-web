libs.shelbyGT.InStreamRollPromoView = Support.CompositeView.extend({

  tagName : 'li',

  events : {
    "click .js-goto-roll" : "_goToRoll"
  },

  template : function(obj){
    return JST['in-stream-roll-promo'](obj);
  },

  initialize : function() {
    if (!this.model) {
      var featuredRolls = _(libs.shelbyGT.Onboarding.rolls).reduce(function(memo, category){return memo.concat(category.rolls);}, []);
      this.model = (new Backbone.Collection());
      this.model.add(new Backbone.Model(featuredRolls[Math.floor(Math.random() * (featuredRolls.length))]));
    }
  },

  render : function(){
    this.$el.html(this.template({rolls:this.model}));
  },

  _goToRoll : function(e){
    shelby.router.navigate('roll/' + $(e.currentTarget).data('roll_id'), {trigger:true});
  }

});