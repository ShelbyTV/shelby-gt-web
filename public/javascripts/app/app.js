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

// setup ajax defaults
$.ajaxSetup({
  xhrFields: {withCredentials: true},
  data: {'cs_key': 'GoatsFTW'}
});

$(document).ajaxError(function(event, jqXHR, ajaxSettings, thrownError){
  if (jqXHR.status == 401) {
    alert("You're not authenticated with the Shelby API, we should redirect and authenticate you.");
  } else {
    alert("Something went wrong. Shelby apologizes.");
  }
});

$(document).ready(function(){
  window.shelby.router = new AppRouter();
  Backbone.history.start({pushState:true});
});
