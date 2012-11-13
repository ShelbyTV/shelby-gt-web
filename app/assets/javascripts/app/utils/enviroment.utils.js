(function(){
  /*
   * Environment Utility
   */
  libs.utils.environment = {

    envs : {
      production : 'production',
      staging : 'staging',
      development : 'development'
    },

    isDevelopment : function(){
      return this.getEnvironment === this.envs.development;
    },

    isStaging : function(){
      return this.getEnvironment === this.envs.staging;
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
