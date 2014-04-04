libs.shelbyGT.ConnectFacebookInStreamView = libs.shelbyGT.ListItemView.extend({

  tagName : "li",

  className: "list__item",

  id: "inline-cta--sources",

  template : function(obj){
    return $('#js-social-facebook-promo-template').html();
  },

  render : function(){
    this.$el.html(this.template({}));
    return this;
  },

});