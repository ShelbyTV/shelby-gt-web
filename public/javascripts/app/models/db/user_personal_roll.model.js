libs.shelbyGT.UserPersonalRollModel = libs.shelbyGT.RollModel.extend({

  sync : function(method, model, options) {
    if (!options.url && method == 'read') {
      options.url = shelby.config.apiRoot + '/user/' + this.get('creator_id') + '/rolls/personal/frames';
      return libs.shelbyGT.ShelbyBaseModel.prototype.sync.call(this, method, model, options);
    } else {
      return libs.shelbyGT.RollModel.prototype.sync.call(this, method, model, options);
    }
  },

  fetchWithoutFrames : function(options) {
    // default options
    options = _.chain({}).extend(options).defaults({
      url : shelby.config.apiRoot + '/user/' + this.get('creator_id') + '/rolls/personal'
    }).value();

    return this.fetch(options);
  }

});
