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
      return window.location.host.indexOf('gt.shelby.tv')!==-1 ? this.envs.production : this.envs.development;
    }

  };

})();
