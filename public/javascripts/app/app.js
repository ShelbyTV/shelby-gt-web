// global mechanism for including library prototypes
libs = {
  shelbyGT : {},
  utils : {} 
};

// global namespace for this app
shelby = {
  models : {},
  views : {},
  config : {
    apiRoot : 'http://localhost:3000/v1'//'http://api.gt.shelby.tv//v1'
  }
};

// setup ajax defaults
$.ajaxSetup({
  xhrFields: {withCredentials: true},
  data: {'cs_key': 'GoatsFTW'}
});

$(document).ajaxError(function(event, jqXHR, ajaxSettings, thrownError){
  if (jqXHR.status == 401) {
    console.log("You're not authenticated with the Shelby API, we should redirect and authenticate you.");
  } else {
    console.log("Something went wrong. Shelby apologizes.");
  }
});

$(document).ready(function(){
  shelby.router = new AppRouter();
  Backbone.history.start({ pushState:true });
});
