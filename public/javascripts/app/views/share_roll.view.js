libs.shelbyGT.ShareRollView = libs.shelbyGT.ShareView.extend({

  el: '#js-share-roll',

  _share : function(){
    var self = this;
    if(!this._validateShare()) return false;
    console.log('sharing', this.model.get('text'), 'to', this.model.get('destination'));
    this._components.spinner && this._toggleSpinner();
    //fake sharing
    /*setTimeout(function(){
      self._onShareSuccess();
    }, 400);*/
    //uncomment for real sharing
    this.model.save(null, this._getSaveOpts());
    return false;
  },

  _onShareSuccess : function(){
    var self = this;
    this._clearTextArea(); //hmm this should be shared for all inheritors...
    this._components.spinner && this._toggleSpinner();
    this._displayOverlay(function(){
      self.$el.slideToggle(function(){
        self.$('.video-shared').remove();
      }); 
    });
  },
  
  // Compulsory if _components.spinner
  
  _initSpinner : function(){
    return new libs.shelbyGT.SpinnerView({ spinOpts: { lines: 11, length: 0, width: 3, radius: 7, rotate: 0, color: '#000', speed: 1.4, trail: 62, shadow: false, hwaccel: true, className: 'spinner', zIndex: 2e9, top: 'auto', left: 'auto' } });
  },

  _toggleSpinner : function(){
    if (this.$('.spinner').length){
      this.$('.js-submit-share').html('Share it');
    } else {
      this.$('.js-submit-share').html(this.spinner.renderSilent());
    }
  },


  // Non-compulsory

  _getSaveOpts : function(){
    var self = this;
    return {
      url : shelby.config.apiRoot + '/roll/'+shelby.models.guide.get('currentRollModel').id+'/share',
      success : function(){
        self._onShareSuccess();
      },
      error : function(){
        console.log('sharing failed - bug fix needed')
      }
    };
  },
  
  //callback to be called when fading is done
  _displayOverlay : function(cb){
    this.$('.share-comment').append(JST['shared-indicator']());
    setTimeout(function(){
      cb();
    }, 700);
  }

});
