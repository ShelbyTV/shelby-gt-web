libs.shelbyGT.ShareRollView = libs.shelbyGT.ShareView.extend({

  id : "js-share-roll",

  className : "share-dialog",

  initialize : function(){
    if(!this.options.roll.get('public')){
      this._components = $.extend({}, libs.shelbyGT.ShareView.prototype._components,{
        networkToggles: false,
        messageCounter: false,
        emailAddresses: true,
        shareButtonCopy: "Invite Friends"
      });
      this.model.set('destination', ['email']);
    }
    
    libs.shelbyGT.ShareView.prototype.initialize.call(this);
  },

  saveUrl: function(){
    return shelby.config.apiRoot + '/roll/' + this.options.roll.id + '/share';
  },

  onShareSuccess: function(){
    var self = this;
    this._displayOverlay(function(){
      self.options.viewState.set({
        visible : false,
        slide : true,
        shareSuccess : true
      }, {
        silent:true
      });
      self.options.viewState.change();
    });
  },

  updateVisibility : function(visible, slide, cb) {
    var self = this;
    var afterToggle = function(){
      //if we're hiding after a successful share we have additional cleanup to do
      if (!visible) {
        if (self.options.viewState.get('shareSuccess')) {
          self.$('.video-shared').remove();
          self.$('.js-share-textarea').attr('placeholder','Add a message...');
          libs.shelbyGT.ShareView.prototype.onShareSuccess.call(self);
          self.options.viewState.set('shareSuccess', false);
        }
      }
      //a callback is optionally supplied by the caller for things to do after
      //the view has been fully toggled
      if (cb) {
        cb();
      }
    };

    if (slide) {
      this.$el.slideToggle(afterToggle);
    } else {
      this.$el.toggle();
      afterToggle();
    }
  },

  //callback to be called when fading is done
  _displayOverlay : function(cb){
    this.$('.share-comment').append(JST['shared-indicator']());
    setTimeout(function(){
      cb();
    }, 700);
  }

});
