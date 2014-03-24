libs.shelbyGT.ConnectChannelsInStreamView = libs.shelbyGT.ListItemView.extend({

  tagName : "li",

  className: "list__item",

  id: "inline-cta--sources",

  events : {
    "click .js-inline_sources_cta" : "onClickConnectChannels"
  },

  template : function(obj){
    return $('#js-channels-promo-template').html();
  },

  render : function(){
    this.$el.html(this.template({}));
    return this;
  },

  onClickConnectChannels : function(e){
    e.preventDefault();
    shelby.router.navigate(e.currentTarget.pathname, {trigger:true});
  }

});