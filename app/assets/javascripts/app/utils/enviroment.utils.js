(function(){
  /*
   * Environment Utility
   */
  libs.utils.environment = {

    envs : {
      production : 'production',
      development : 'development'
    },

    isDevelopment : function(){
      return this.getEnvironment === this.envs.development;
    },

    isProduction : function(){
      return this.getEnvironment === this.envs.production;
    },

    getEnvironment : function(){
      return shelby.config.environment;
      //return window.location.host.indexOf('localhost.shelby.tv')!==-1 ? this.envs.development : this.envs.production;
    }

  };

})();
