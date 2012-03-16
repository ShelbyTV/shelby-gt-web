/*
 * These are tests to log to the console the event activity associated with various different ways
 * of manipulating relational and non-relational collections with backbone-relational included.
 * IMPORTANT NOTE: These tests only work currently from the /rolls/:id route.
 */

var CollectionTests = {
  testEventHandling : function() {
    // test a relational model
    console.log('---RELATIONAL MODEL---');
    var relationalModel = shelby.models.guide.get('contentPaneModel');
    relationalModel.bind('add:frames', function(){console.log('event: relational add');});
    relationalModel.bind('reset:frames', function(){console.log('event: relational reset');});
    relationalModel.get('frames').bind('add', function(){console.log('event: standard add');});
    relationalModel.get('frames').bind('reset', function(){console.log('event: standard reset');});

    console.log('model.fetch');
    relationalModel.fetch({success:function(){
        console.log('model.fetch({add:true})');
        relationalModel.fetch({add:true,success:function(){
            console.log("model.get('frames').fetch");
            relationalModel.get('frames').fetch({success:function(){
                console.log("model.get('frames').fetch({add:true})");
                relationalModel.get('frames').fetch({add:true,success:function(){
                    console.log("model.get('frames').sort()");
                    relationalModel.get('frames').sort();
                    console.log("model.get('frames').reset([models])");
                    relationalModel.get('frames').reset(shelby.models.guide.get('contentPaneModel').get('frames').models);
                    console.log("model.get('frames').reset()");
                    relationalModel.get('frames').reset();
                 

                    // all the relational model event handlers we wanted to test have fired, so unbind them
                    relationalModel.unbind('add:frames', function(){console.log('event: relational add');}, this);
                    relationalModel.unbind('reset:frames', function(){console.log('event: relational reset');}, this);
                    relationalModel.get('frames').unbind('add', function(){console.log('event: standard add');}, this);
                    relationalModel.get('frames').unbind('reset', function(){console.log('event: standard reset');}, this);
   

                    // now test a relational collection
                    console.log('---RELATIONAL COLLECTION---');
                    var collection = new FramesCollection();
                    collection.bind('add', function(){console.log('event: collection standard add');});
                    collection.bind('reset', function(){console.log('event: collection standard reset');});
                    collection.bind('relational:add', function(){console.log('event: collection overidden add');});
                    collection.bind('relational:reset', function(){console.log('event: collection overidden reset');});
                    console.log('collection.fetch');
                    collection.fetch({success:function(){
                        console.log('collection.fetch({add:true})');
                        collection.fetch({add:true,success:function(){
                            console.log("collection.sort()");
                            collection.sort();
                            console.log("collection.reset([models])");
                            collection.reset(collection.models);
                            console.log("collection.reset()");
                            collection.reset();

                            // all the relational collection event handlers we wanted to test have fired, so unbind them
                            collection.unbind('add');
                            collection.unbind('reset');
                            collection.unbind('relational:add');
                            collection.unbind('relational:reset');

                            //now test a standard collection
                            console.log('---STANDARD COLLECTION---');
                            collection2 = new FramesNonRelationalCollection();
                            collection2.bind('add', function(){console.log('event: collection standard add');});
                            collection2.bind('reset', function(){console.log('event: collection standard reset');});
                            collection2.bind('relational:add', function(){console.log('event: collection overidden add');});
                            collection2.bind('relational:reset', function(){console.log('event: collection overidden reset');});
                            console.log('collection.fetch');
                            collection2.fetch({success:function(){
                                console.log('collection.fetch({add:true})');
                                collection2.fetch({add:true,success:function(){
                                    console.log("collection.sort()");
                                    collection2.sort();
                                    console.log("collection.reset([models])");
                                    collection2.reset(collection2.models);
                                    console.log("collection.reset()");
                                    collection2.reset();

                                    // all the standard collection event handlers we wanted to test have fired, so unbind them
                                    collection2.unbind('add');
                                    collection2.unbind('reset');
                                    collection2.unbind('relational:add');
                                    collection2.unbind('relational:reset');
                                }});
                            }});
                        }});
                    }});
                }});
            }});
        }});
    }});
  }
};
