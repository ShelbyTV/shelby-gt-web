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

      var self = this;

      var opts = {
        type : 'POST',
        url : this._get_api_root()+'/'+path,
        data : data,
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
    }

  };
  
  commands.forEach(function(cmd){
    libs.utils.rhombus[cmd] = function(arg1){
      libs.utils.rhombus._post(cmd, arguments);
    };
  });

})();
