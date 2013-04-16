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
    $('#js-email-collection-wrapper').toggleClass('hidden', true);
    $('.welcome-message__wrapper--email_collection').show();
  },

  _onEmailSubmit : function(){
    var self = this;
     var email = _(this.$el.find('#js-email-input').val()).clean();
    $.get(shelby.config.apiRoot+'/POST/gt_interest', {email: email}, function(data) {
        $('#js-email-form-submit').addClass('hidden');
        $('#js-email-form-feedback').removeClass('hidden');

        setTimeout(function(){
          $('.js-email-collection').toggleClass('hidden', true);
        }, 3000);

        shelby.models.user.set('emailCollected', true);
        // event tracking
        shelby.trackEx({
          providers : ['ga', 'kmq'],
          gaCategory : "Email Collection",
          gaAction : 'Email submitted',
          gaLabel : 'Channels',
          kmName : "Email submitted in collection modal on channels",
          kmqProperties : {'email' : email}
        });
        // set kissmetrics identity
        shelby.track('identify', {nickname: email});
        // set cookie so we remember
        cookies.set('beta_signup', email, 180);
      }, 'jsonp');
      return false;
  },

  _onShowEmailCollection : function(){
    var self = this;
    var _emailCollectorShown = shelby.models.user.get('emailCollectorShown');
    var _emailCollected = shelby.models.user.get('emailCollected');

    setTimeout(function(){
      $('.js-email-collection').toggleClass('hidden', false);

      // event tracking
      if (!_emailCollectorShown) {
        shelby.trackEx({
          providers : ['ga', 'kmq'],
          gaCategory : "Email Collection",
          gaAction : 'Loaded',
          gaLabel : 'Channels',
          kmName : "Email collection modal loaded on channels"
        });
      }

    }, 500);
    shelby.models.user.set('emailCollectorShown', true);
  },

  _close : function() {
    $('.js-email-collection').toggleClass('hidden', true);
    // event tracking
    shelby.trackEx({
      providers : ['ga', 'kmq'],
      gaCategory : "Email Collection",
      gaAction : 'Close modal',
      gaLabel : 'Channels',
      kmName : "Email collection modal closed on channels"
    });
  }

});
