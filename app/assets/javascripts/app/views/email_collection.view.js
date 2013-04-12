libs.shelbyGT.emailCollection = Support.CompositeView.extend({

  events : {

  },

  template : function(obj){
    return SHELBYJST['channels/email-collection'](obj);
  },

  initialize : function(){
    this.render();
  },

  cleanup : function(){
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
  }


});
