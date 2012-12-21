// implements common functionality needed by models in the shelby app

libs.shelbyGT.ShelbyBaseModel = Backbone.RelationalModel.extend({
  // extract the JSON from the "result" property of a Shelby API response
  parse : function (response) {
    return response.result;
  },
  
  methodMap : {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read':   'GET'
  },
  
  sync : function(method, model, options) {
    
    if( !Browser.supportsCORS() ){
      //send as JSONP
      overrides = {
        dataType: 'jsonp',
        contentType: 'application/x-www-form-urlencoded'
        };
        
      //re-encode the model properly for the URL
      if (model && (method == 'create' || method == 'update')) {
        overrides.data = $.param(model.toJSON());
      }
      _.extend(options, overrides);
    
      // dynamically re-write the route to append POST/ PUT/ DELETE/ after v1/
      if (!options.url) {
        options.url = _.isFunction(model.url) ? model.url() : model.url;
      }
      if( method != 'read' ){
        var loc = options.url.indexOf("/v1/");
        options.url = options.url.slice(0,loc+3) + "/" + this.methodMap[method] + options.url.slice(loc+3);
      }
    }
    
    return Backbone.sync(method, model, options);
  },
  
  // supporting the following additional events (in addition to those of Backbone)
  messages : {
    fetchComplete : "fetch:complete",
  },
  
  fetch : function(options){
    var self = this;
    var jqXHR = Backbone.Model.prototype.fetch.call(this, options);
    jqXHR.success(function(resp){
      self.trigger(self.messages.fetchComplete);
    });
    return jqXHR;
  },
  
  /*  method: triggerTransientChange
      description: Conveniece method to set model attribute, in the process executing all change handlers bound and
        scoped to that attribute, then reset the attribute to null. Allows a stateful approach to sending
        'signals' (might call them pulses or triggers also)
  */
  triggerTransientChange : function(attribute, value) {
    this.set(attribute, value);
    this.set(attribute, null);
  },
  
  hasBsonId: function(){
    //should be a 24 character
    if(this.id.length !== 24){ return false; }
    //hexadecimal
    var idAsInt = parseInt(this.id, 16);
    //starting with timestamp
    return idAsInt > 4000000000000000000000000;
  }

});
