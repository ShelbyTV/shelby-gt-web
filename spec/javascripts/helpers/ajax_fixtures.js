beforeEach(function() {

  this.ajaxFixtures = {
    
    RollCollections: {
      valid: { // response starts here
        "status": 200,
        "result": [
            {
              "category_title": 'Sports',
              "rolls": []
            },
            {
              "category_title": 'Memes',
              "rolls": [{id:'id1'},{id:'id2'}]
            }
          ]
      }
    }
    
  };

});