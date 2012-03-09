MyRouter = Backbone.Router.extend({
  // declare routes in order from most to least specific
  routes : {
    "specific/:id/route/:id": "handleVerySpecificRoute",
    "specific/:id" : "handleLessSpecificRoute",
    "specific/*anything" : "handleGeneralRoute",
    "*unspecific" : "handleCatchAllRoute"
  },

  // route handler methods come first, in the same order as their routes are declared
  // identify this set of methods with a comment

  // ---
  // ROUTE HANDLERS
  // ---

  handleVerySpecificRoute : function(){
    _privateHelper();
    alert('More specific route');
  },

  handleLessSpecificRoute : function(){
    _privateHelper();
    alert('Less specific route');
  },

  handleGeneralRoute : function(){

  },

  handleCatchAllRoute : function(){
    alert('Bad URL');
  },

  // use private methods to perform convenient operations shared by multiple routes
  // include these methods after the route handlers
  // identify this set of methods with a comment

  // ---
  // PRIVATE METHODS
  // ---

  _privateHelper : function(){
    alert('Here I perform shared operations');
  }
});