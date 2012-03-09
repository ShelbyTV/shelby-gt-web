/*
 * When fetching a RelationalModel, with a collection
 * defined on it (as a rel) the collection will not 
 * fire events in accordance w/ Backbone protocol
 *
 */

var std = function(){
 var relModel = new SomeRelationalModel();

 relModel.get('myRelColl').bind('add', addOne);
 relModel.get('myRelColl').bind('reset', addAll);
 relModel.fetch();
 /*
  * What we expect (Bbone protocol)
  * ------------------------------
  * 1. fetches n models
  * 2. 'reset' is triggered once w/ n models
  *
  * What happens
  * -----------
  * 1.fetches n models
  * 2. 'reset' is triggered once with n models
  * 3. 'add' is triggered n times
  */

};

/*
 * When dealing w/ embedded relational collections
 * only bind to the 'add' event
 * When dealing w/ standard backbone collections
 * only bind to the 'add' event and only call 
 * collection.fetch({add:true})
 * Don't re-fetch standard collections - create new Views
 */

var condom = function(){
  var relModel = new SomeRelationalModel();

  relModel.get('myRelColl').bind('add', addOne);
  //relModel.get('myRelColl').bind('reset', addAll);
  relModel.fetch();
};
