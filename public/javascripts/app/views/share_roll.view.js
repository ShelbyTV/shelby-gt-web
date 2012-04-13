libs.shelbyGT.ShareRollView = libs.shelbyGT.ShareView.extend({

  el: '#js-share-roll',

  saveUrl: function(){
    return shelby.config.apiRoot + '/roll/'+shelby.models.guide.get('currentRollModel').id+'/share';
  },

  onShareSuccess: function(){
    var self = this;
    this._displayOverlay(function(){
      self.$el.slideToggle(function(){
        self.$('.video-shared').remove();
        self.$('.js-share-textarea').attr('placeholder','Add a message...');
        libs.shelbyGT.ShareView.prototype.onShareSuccess.call(self);
      });
    });
  },

  //callback to be called when fading is done
  _displayOverlay : function(cb){
    this.$('.share-comment').append(JST['shared-indicator']());
    setTimeout(function(){
      cb();
    }, 700);
  }

});
