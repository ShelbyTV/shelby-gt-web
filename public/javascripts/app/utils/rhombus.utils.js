(function(){
  
  var commands = ['set', 'hset', 'sadd', 'incrby'];

  libs.utils.rhombus = {

    _api_root : function(){
      return window.location.host.indexOf('localhost')!==-1 ? 'http://localhost.shelby.tv:3010' : 'http://localhost.shelby.tv:3010';
    }, 
    
    _post : function(cmd, args){

      var data = {
        args : []
      };

      Object.keys(args).forEach(function(k){
        data.args.push(args[k]);
      });

      var opts = {
        type : 'POST',
        url : this._api_root()+'/'+cmd,
        data : data,
        error : function(){
          console.log(arguments);
          console.log("couldn't contact local rhombus API .. not a big deal");
        },
        success : function(){
          console.log(arguments);
          //do nothing
        }
      };

      jQuery.ajax(opts);
    }

  };
  
  // weirdest js design pattern ever?
  commands.forEach(function(cmd){
    libs.utils.rhombus[cmd] = function(){
      libs.utils.rhombus._post(cmd, arguments);
    };
  });

})();
