libs.shelbyGT.emailCollection = Support.CompositeView.extend({

  events : {
      "submit #js-email-form"     : "_onEmailSubmit",
      "click .js-close"                   : "_close"
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

  _onEmailSubmit : function(){
    var self = this;
     var email = _(this.$el.find('#js-email-input').val()).clean();
    $.get(shelby.config.apiRoot+'/POST/gt_interest', {email: email}, function(data) {
        $('#js-email-form-submit').addClass('hidden');
        $('#js-email-form-feedback').removeClass('hidden');
        setTimeout(function(){
          self.$el.toggleClass('hidden', false);
        }, 3000);
        // TODO this view to know not to render again during this users session, maybe include cookie tracking of this?
      }, 'jsonp');
      return false;
  },

  _onShowEmailCollection : function(){
    this.$el.show();
  },

  _close : function() {
    this.$el.toggleClass('hidden');
  }

});
