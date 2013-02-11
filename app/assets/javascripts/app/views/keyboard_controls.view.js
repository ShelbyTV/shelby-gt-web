(function(){

  libs.shelbyGT.KeyboardControlsView = Backbone.View.extend({

    events : {
      "focus input"    : "_onTypeableFocus",
      "focus textarea" : "_onTypeableFocus",
      "blur input"     : "_onTypeableBlur",
      "blur textarea"  : "_onTypeableBlur"
    },

    el : 'body',

    _keyCodeActionMap : {

      //  spacebar
      32 : {
        model : 'userDesires',
        attr : 'playbackStatus',
        val : function(){
          var playbackState = shelby.models.playbackState.get('activePlayerState');
          if (playbackState) {
            return playbackState.get('playbackStatus') === 'playing' ?
            libs.shelbyGT.PlaybackStatus.paused :
            libs.shelbyGT.PlaybackStatus.playing;
          } else {
            return false;
          }
        },
        is_transient : true
      },
      // (g)uide
      71 : {
        model : 'userDesires',
        attr : 'guideShown',
        val : function(){
          return !shelby.models.userDesires.get('guideShown');
        }
      },
      // (m)ute
      77 : {
        model : 'userDesires',
        attr : 'mute',
        val : function(){
          return !shelby.models.userDesires.get('mute');
        }
      },
      // (->) right
      39 : {
        model : 'userDesires',
        attr : 'changeVideo',
        val : 1,
        is_transient : true
      },
      // (<-) left
      37 : {
        model : 'userDesires',
        attr : 'changeVideo',
        val : -1,
        is_transient : true
      },
      // up
      38 : {
        model : 'userDesires',
        attr : 'changeChannel',
        val : 1,
        is_transient : true
      },
      // down
      40 : {
        model : 'userDesires',
        attr : 'changeChannel',
        val : -1,
        is_transient : true
      },
      // (l)ink
      76 : {
        model : 'userDesires',
        attr : 'shortLink',
        val : function(){
          if (shelby.models.guide.get('activeFrameModel')){
            var _frameId = shelby.models.guide.get('activeFrameModel').id;
            $.ajax({
              url: 'http://api.shelby.tv/v1/frame/'+_frameId+'/short_link',
              dataType: 'json',
              success: function(r){ shelby.alert({message: r.result.short_link}); }
            });
          }
        },
        is_transient : true
      }
    },

    initialize : function(){
      this._setupKeyboardBindings();
      this._disableSpacebarScrolling();
    },

    _disableSpacebarScrolling : function(){
      var self = this;
      $(document).on('keydown', function(e){
        //if we aren't typing
        if (!shelby.models.userDesires.get('typing')){
          // cancel default behavior of space
          return !(e.keyCode == 32);
        }
      });
    },

    _onTypeableFocus : function(){
      shelby.models.userDesires.set('typing', true);
    },

    _onTypeableBlur : function(){
      shelby.models.userDesires.set('typing', false);
    },

    _setupKeyboardBindings : function(){
      var self = this;
      $(document).on('keyup', function(event){
        if(shelby.models.userDesires.get('typing')) return false;
        var actionData = self._getActionData(event.keyCode);
        if(!actionData) return false;
        if(!actionData.is_transient){
          shelby.models[actionData.model].set(actionData.attr, actionData.val);
        } else {
          shelby.models[actionData.model].triggerTransientChange(actionData.attr, actionData.val);
        }
        return false;
      });
    },

    _getActionData : function(keyCode){
      var actionDataRaw = _.clone(this._keyCodeActionMap[keyCode]);
      if(!actionDataRaw) return false;
      actionDataRaw.val = (typeof actionDataRaw.val === 'function') ? actionDataRaw.val() : actionDataRaw.val;
      return actionDataRaw;
    }

  });
})();
