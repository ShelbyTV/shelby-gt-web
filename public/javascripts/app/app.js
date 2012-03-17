Backbone.___sync = Backbone.sync;
Backbone.sync = function(method, model, options) {
  if (!options) {
    options = {};
  }
  if (!options.error) {
    options.error = function(){alert('Something went wrong. Shelby apologizes.');};
  }
  return Backbone.___sync(method, model, options);
}



// global mechanism for including library prototypes
window.libs = {
  shelbyGT : {},
  utils : {} 
};



// global namespace for this app
window.shelby = {
	models : {},
  views : {},
  config : {
    apiRoot : 'http://108.166.56.26/v1'
  }
};

$(document).ready(function(){
  window.shelby.router = new AppRouter();
  Backbone.history.start({pushState:true});
});
