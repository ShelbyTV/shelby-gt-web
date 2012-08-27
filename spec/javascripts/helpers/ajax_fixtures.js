beforeEach(function() {

  this.ajaxFixtures = {
    
    RollCollections: {
      valid: { // response starts here
        "status": 200,
        "result": [
            {
              "category": 'Sports',
              "rolls": []
            },
            {
              "category": 'Memes',
              "rolls": [{id:'id1'},{id:'id2'}]
            }
          ]
      }
    }
    
  };

});