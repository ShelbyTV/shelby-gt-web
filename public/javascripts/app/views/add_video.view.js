libs.shelbyGT.addVideoView = Support.CompositeView.extend({

  events : {
		"click #js-add-video" : "_addVideoViaURL"
  },

  el : '#js-add-video-area',

  template : function(obj){
    return JST['add-video-area'](obj);
  },

  initialize : function(){
    this.model.bind('change:displayState', this._updateVisibility, this);
    this.model.bind('change:currentRollModel', this._updateHeaderView, this);
    
    this.render();
  },

  _cleanup : function(){
    this.model.unbind('change:displayState', this._updateVisibility, this);
    this.model.unbind('change:currentRollModel', this._updateHeaderView, this);
  },

  render : function(){
    this.$el.html(this.template());
    if (this.model.get('displayState') == libs.shelbyGT.DisplayState.standardRoll) {
      this.$el.show();
    }
	},
	
	_updateVisibility : function(guideModel, displayState){		
    if (displayState == libs.shelbyGT.DisplayState.standardRoll) {
      this.$el.show();
    } else {
      this.$el.hide();
    }
  },
  
	_updateHeaderView : function(guideModel, currentRollModel) {
		// hide add video area if roll is collaboritive or if user is creator
		if ((currentRollModel.get('creator_id') === shelby.models.user.id) || currentRollModel.get('collaborative')) {
			this.$el.show();
		}
		else {
			this.$el.hide();
		}
	},

	_addVideoViaURL : function(){
		var _url = this.$('input#js-video-url-input').val();
		// check if url given is valid syntax
		var regex = new RegExp(/^(https?):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i);
		if (regex.test(_url)) {
			var self = this;
			var frame = new libs.shelbyGT.FrameModel();
			frame.save(
				{url: _url, source: 'webapp'},
				{url: shelby.config.apiRoot + '/roll/'+this.model.get('currentRollModel').id+'/frames', 
				wait: true,
				global: false,
				success: function(frame){
					self.model.get('currentRollModel').get('frames').add(frame, {at:0});
					self.$('#js-video-url-input').removeClass('error').attr('placeholder', "yay! your video was added!").val("");
					setTimeout(function(){
						self.$('#js-video-url-input').attr('placeholder', "add to shelby via a url").val("");
					}, 1500);
				},
				error: function(a,b,c){
					if (b.status == 404) { self._addVideoError(JSON.parse(b.responseText).message); }
					else { alert("sorry, something went wrong. contact support@shelby.tv if you think somethings wonky."); };
				}
			});
    } 
		else {
			this._addVideoError("I don't think " + _url + " is a valid url");
    }
	},

	_addVideoError: function(message){
		alert(message);
	}

});