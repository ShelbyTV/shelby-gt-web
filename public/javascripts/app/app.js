// global mechanism for including library prototypes
window.libs = {};
window.libs.shelbyGT = {};

// global namespace for this app
window.shelby = {
	models : {},
    views : {},
};

$(document).ready(function(){
  window.shelby.router = new AppRouter();
  Backbone.history.start({pushState:true});
});
