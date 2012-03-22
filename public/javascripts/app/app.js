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
    apiRoot : 'http://api.gt.shelby.tv/v1'
  }
};

// setup ajax defaults
$.ajaxSetup({
  xhrFields: {withCredentials: true},
  data: {'cs_key': 'GoatsFTW'}
});

// global ajax error handling to handle users who are not authenticated and other unexpected errors
// disable for more specific error handling by using the jQuery.ajax global:false option
$(document).ajaxError(function(event, jqXHR, ajaxSettings, thrownError){
  libs.shelbyGT.Ajax.defaultOnError(event, jqXHR, ajaxSettings, thrownError)
});

$(document).ready(function(){
  shelby.router = new libs.shelbyGT.AppRouter();
  Backbone.history.start({pushState:true});
});
