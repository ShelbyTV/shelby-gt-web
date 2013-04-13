libs.shelbyGT.emailCollection = Support.CompositeView.extend({

  events : {
      "click .js-close" : "_close"
  },

  template : function(obj){
    return SHELBYJST['channels/email-collection'](obj);
  },

  initialize : function(){
    Backbone.Events.bind('show:emailCollection', this._onShowEmailCollection, this);
    this.render();
  },

  cleanup : function(){
    Backbone.Events.unbind('show:emailCollection', this._onShowEmailCollection, this);
  },

  render : function(){
    this.$el.html(this.template());
    $('#email-collection-wrapper').toggleClass('hidden', true);

    shelby.trackEx({
        providers : ['ga', 'kmq'],
        gaCategory : "Email Collection",
        gaAction : 'Loaded',
        gaLabel : 'Channels',
        kmName : "Email collection modal loaded on channels"
      });
  },

  _onShowEmailCollection : function(){
    this.$el.show();
  },

  _close : function() {
    this.$el.toggleClass('hidden');
  }

});
