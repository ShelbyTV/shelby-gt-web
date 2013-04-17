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
      //  esc
      27 : {
        model : 'userDesires',
        attr : 'keyboardShortcuts',
        val : function(){
          if(libs.shelbyGT.DisplayState.channel) {
            shelby.userInactivity.enableUserActivityDetection();
            shelby.models.playbackState.set('autoplayOnVideoDisplay', true);
            $('#js-welcome').toggleClass('hidden', true);
            return !shelby.models.userDesires.set('playbackStatus',libs.shelbyGT.PlaybackStatus.playing);
          }
        },
        is_transient : true
      },
      //  spacebar
      32 : {
        model : 'userDesires',
        attr : 'playbackStatus',
        val : function(){
          var playbackState = shelby.models.playbackState.get('activePlayerState');
          shelby.trackEx({
            gaCategory : 'Keyboard',
            gaAction : 'spacebar',
            gaLabel : shelby.models.user.get('nickname')
          });
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
          shelby.trackEx({
            gaCategory : 'Keyboard',
            gaAction : 'guide',
            gaLabel : shelby.models.user.get('nickname')
          });
          return !shelby.models.userDesires.get('guideShown');
        }
      },
      // (m)ute
      77 : {
        model : 'userDesires',
        attr : 'mute',
        val : function(){
          shelby.trackEx({
            gaCategory : 'Keyboard',
            gaAction : 'mute',
            gaLabel : shelby.models.user.get('nickname')
          });
          return !shelby.models.userDesires.get('mute');
        }
      },
      // (->) right
      39 : {
        model : 'userDesires',
        attr : 'changeChannel',
        val : function(){
          shelby.trackEx({
            gaCategory : 'Keyboard',
            gaAction : 'right',
            gaLabel : shelby.models.user.get('nickname')
          });
          return 1;
        },
        is_transient : true,
        preventDefault : {
          keyDown : function () {
            return shelby.models.guide.get('displayState') == libs.shelbyGT.DisplayState.dotTv;
          }
        }
      },
      // (<-) left
      37 : {
        model : 'userDesires',
        attr : 'changeChannel',
        val : function(){
          shelby.trackEx({
            gaCategory : 'Keyboard',
            gaAction : 'left',
            gaLabel : shelby.models.user.get('nickname')
          });
          return -1;
        },
        is_transient : true,
        preventDefault : {
          keyDown : function () {
            return shelby.models.guide.get('displayState') == libs.shelbyGT.DisplayState.dotTv;
          }
        }
      },
      // up
      38 : {
        model : 'userDesires',
        attr : 'changeVideo',
        val : function(){
          shelby.trackEx({
            gaCategory : 'Keyboard',
            gaAction : 'up',
            gaLabel : shelby.models.user.get('nickname')
          });
          return -1;
        },
        is_transient : true,
        preventDefault : {
          keyDown : function () {
            return shelby.models.guide.get('displayState') == libs.shelbyGT.DisplayState.dotTv;
          }
        }
      },
      // down
      40 : {
        model : 'userDesires',
        attr : 'changeVideo',
        val : function(){
          shelby.trackEx({
            gaCategory : 'Keyboard',
            gaAction : 'down',
            gaLabel : shelby.models.user.get('nickname')
          });
          return 1;
        },
        is_transient : true,
        preventDefault : {
          keyDown : function () {
            return shelby.models.guide.get('displayState') == libs.shelbyGT.DisplayState.dotTv;
          }
        }
      },
      // (s)hort link
      83 : {
        model : 'userDesires',
        attr : 'shortLink',
        val : function(){
          shelby.trackEx({
            gaCategory : 'Keyboard',
            gaAction : 'link',
            gaLabel : shelby.models.user.get('nickname')
          });
          if (shelby.models.guide.get('activeFrameModel')){
            var _frameId = shelby.models.guide.get('activeFrameModel').id;
            $.ajax({
              url: 'http://api.shelby.tv/v1/frame/'+_frameId+'/short_link',
              dataType: 'json',
              success: function(r){ shelby.dialog({
                message: '<p>Shortlink</p><p><input type="text" value="'+r.result.short_link+'" class="form_input one-half" autofocus/></p>',
                button_primary: {
                  title: "Done"
                }
              }); }
            });
          }
        },
        is_transient : true
      },

      // ? (question mark)
      191 : {
        model : 'userDesires',
        attr : 'keyboardShortcuts',
        val : function(){
          if(shelby.models.guide.get('displayState') == libs.shelbyGT.DisplayState.channel) {
            if ($('#js-welcome').hasClass('hidden')){
              shelby.userInactivity.disableUserActivityDetection();
              //shelby.models.userDesires.set({guideShown: false});
              // $('.tooltip').show();
              // $('.welcome-message').hide();
            }
            else {
              // $('.tooltip').hide();
              shelby.userInactivity.enableUserActivityDetection();
            }
            $('#js-welcome, .js-channels-welcome').toggleClass('hidden', !$('#js-welcome').hasClass('hidden'));
          }
          else if (shelby.models.guide.get('displayState') == libs.shelbyGT.DisplayState.search) {
            if ($('#js-welcome').hasClass('hidden')){
              shelby.userInactivity.disableUserActivityDetection();
              shelby.models.userDesires.set({guideShown: true});
            }
            else {
              shelby.userInactivity.enableUserActivityDetection();
            }
            $('#js-welcome, .js-search-welcome').toggleClass('hidden', !$('#js-welcome').hasClass('hidden'));
          }
        },
        is_transient : true
      }
    },

    initialize : function(){
      this._setupViewSpecificBindings();
      this._setupKeyboardBindings();
      this._disableSpacebarScrolling();
    },

    _setupViewSpecificBindings : function(){
      if (shelby.models.guide.get('displayIsolatedRoll')) {
        // override up/down left/right actions for iso-rolls
        _keyCodeActionMap[37]['attr'] = 'changeVideo'; // left
        _keyCodeActionMap[39]['attr'] = 'changeVideo'; // right
        _keyCodeActionMap[38]['attr'] = 'changeChannel'; // up
        _keyCodeActionMap[40]['attr'] = 'changeChannel'; // down
      }
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
      $(document).on('keyup', function(e){
        if(shelby.models.userDesires.get('typing')) return false;
        var actionData = self._getActionData(e.keyCode);
        if(!actionData) return false;
        if(!actionData.is_transient){
            // is_transient == false,
            //    it just sets it to the new value and leaves it that way
            //    (it's changing a value permanently, which will possibly influence future actions repeatedly)
          shelby.models[actionData.model].set(actionData.attr, actionData.val);
        } else {
            // is_transient == true,
            //    it sets whatever it's going to set to the value it wants,
            //    then immediately sets it back to null
            //    (the change it makes is more like an immediate signal for something to happen)
          shelby.models[actionData.model].triggerTransientChange(actionData.attr, actionData.val);
        }
        return false;
      });
      $(document).on('keydown', function(e){
        if(shelby.models.userDesires.get('typing')) return true;
        var actionData = self._keyCodeActionMap[e.keyCode];
        if(!actionData) return true;
        if (_(actionData).has('preventDefault') && _(actionData.preventDefault).has('keyDown')) {
          if (_(actionData.preventDefault).result('keyDown')) {
            e.preventDefault();
          }
        }
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
