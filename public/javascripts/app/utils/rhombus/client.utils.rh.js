(function(){
  
  var commands = ['set', 'hset', 'sadd', 'incrby', 'lpush'];

  libs.utils.rhombus = {

    _disabled : false,

    _env_api_root_map : {
      "production" : 'http://api.rhombus.shelby.tv',
      "development" : 'http://localhost.shelby.tv:3010'
    },

    _get_api_root : function(){
      return this._env_api_root_map[libs.utils.environment.getEnvironment()];
    }, 

    _post : function(cmd, args){
			if (!shelby.userSignedIn()) return false;
      if (this._disabled) return false;

      var data, path;

      if (typeof cmd === 'object'){

        data = cmd;
        path = cmd.cmd;

      } else {

        path = cmd;

        data = {
          "args" : []
        };

        Object.keys(args).forEach(function(k){
          data['args'].push(args[k]);
        });
      }
      var chorts = _.clone(shelby.models.user.get('cohorts'));
      chorts.push('');
      var self = this;
      var key = data.args[0];
      /*
       * Extreme shit here
       */
      chorts.forEach(function(chort){
        var _data = _.clone(data);
        _data.args[0] = chort.length ? key+':'+chort : key;
        var opts = {
          type : 'POST',
          url : self._get_api_root()+'/'+path,
          data : _data,
          beforeSend : function(xhr, settings){
            xhr.setRequestHeader('Authorization', $('#rhombus-auth').data('token'));
          },
          error : function(){
            self._disabled = true;
            console.log("couldn't contact local rhombus API .. disabling rhombus", arguments);
          },
          success : function(){
            //do nothing
          }
        };
        jQuery.ajax(opts);
        _data.args[0] = key;
      });
    }

  };
  
  commands.forEach(function(cmd){
    libs.utils.rhombus[cmd] = function(arg1){
      libs.utils.rhombus._post(cmd, arguments);
    };
  });

})();
