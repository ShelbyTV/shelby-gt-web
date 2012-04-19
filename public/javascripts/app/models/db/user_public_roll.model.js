libs.shelbyGT.UserPublicRollModel = libs.shelbyGT.RollModel.extend({

  sync : function(method, model, options) {
    if (!options.url && method == 'read') {
      options.url = shelby.config.apiRoot + '/user/' + this.get('creator_id') + '/public_roll/frames';
      return Backbone.sync(method, model, options);
    } else {
      return libs.shelbyGT.RollModel.prototype.sync.call(this, method, model, options);
    }
  }

});
