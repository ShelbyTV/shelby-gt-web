libs.shelbyGT.UserPreferencesNetworksView = Support.CompositeView.extend({

  tagName: 'div',

  className: 'content_lining preferences_page preferences_page--networks',

  options : _.extend({}, Support.CompositeView.prototype.options, {}),

  template : function(obj){
      return SHELBYJST['preferences-networks'](obj);
  },

  render : function(){
    var networks = this.model.get('authentications');

    var data = {
      facebook : _.findWhere(networks, {provider: 'facebook'}),
      twitter  : _.findWhere(networks, {provider: 'twitter'}),
      tumblr   : _.findWhere(networks, {provider: 'tumblr'})
    };

    this.$el.html(this.template(data));
  },

  initialize : function(){
    console.log('/preferences/networks!');
  },

  _cleanup : function(){
  }

});