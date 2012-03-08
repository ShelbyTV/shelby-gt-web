$(document).ready(function(){
  /*var router = new AppRouter();
  window.shelby = {
    models : {}
  };
  window.shelby.router = router;
  Backbone.history.start();*/

  console.log('ready');

  var FakeRouter = Backbone.Router.extend({
    routes : {
      "foo" : "myFunc"
    },
    myFunc : function(){
      console.log('YAY!');
    }
  });

  var fakeRouter = new FakeRouter();
  console.log('matches?', Backbone.history.start());

});
