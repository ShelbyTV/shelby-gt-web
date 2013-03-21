libs.shelbyGT.RollsCollection = Backbone.Collection.extend({

  model: libs.shelbyGT.RollModel,

  getPreviousRoll : function(roll){
    var rollId = typeof(roll) == "string" ? roll : roll.id;
    var index = this.indexOf(this.get(rollId)) - 1;
    if (index < 0) {
      index = this.length - 1;
    }
    return this.at(index);
  },

  getNextRoll : function(roll){
    var rollId = typeof(roll) == "string" ? roll : roll.id;
    var index = (this.indexOf(this.get(rollId)) + 1) % this.length;
    return this.at(index);
  }

});