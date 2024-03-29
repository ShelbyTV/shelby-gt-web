libs.shelbyGT.UserModel = libs.shelbyGT.ShelbyBaseModel.extend({

  relations : [
    {
      type : Backbone.HasOne,
      key : 'watch_later_roll',
      relatedModel : 'libs.shelbyGT.RollModel'
    },{
      type : Backbone.HasOne,
      key : 'personal_roll',
      relatedModel : 'libs.shelbyGT.RollModel'
    },{
      type : Backbone.HasOne,
      key : 'viewed_roll',
      relatedModel : 'libs.shelbyGT.RollModel'
    },{
      type : Backbone.HasOne,
      key : 'app_progress',
      relatedModel : 'libs.shelbyGT.AppProgressModel'
    }
  ],

  // could generalize this.apiRoot and this.useSecureUrl into ShelbyBaseModel to use it elsewhere/DRY up code
  useSecureUrl : false,

  url : function() {
    var apiRoot = this.useSecureUrl ? shelby.config.secure.apiRoot : shelby.config.apiRoot;
    return apiRoot + '/user/' + (this.isNew() ? this.get('nickname') || '' : this.id);
  },

  getFirstName : function(){
    return this.get('name').split(' ')[0];
  },

  parse : function (response) {
    // extract the result property
    var result = libs.shelbyGT.ShelbyBaseModel.prototype.parse.call(this, response);
    //remove the id property from app_progress - THE API SHOULD DO THIS FOR US
    if (result.app_progress && result.app_progress.id){
      delete result.app_progress.id;
    }
    // wrap the watch later and public roll ids in models
    // seems like Backbone Relational should do this for us for lazy loading, but it seems to choke because
    // this is a HasOne relation and there is no model already in the Relational Store with a matching id
    var watchLaterRoll = new libs.shelbyGT.RollModel({id:result.watch_later_roll_id});
    result.watch_later_roll = watchLaterRoll;
    var personalRoll = new libs.shelbyGT.RollModel({id:result.personal_roll_id});
    result.personal_roll = personalRoll;
    var viewedRoll = new libs.shelbyGT.RollModel({id:result.viewed_roll_id});
    result.viewed_roll = viewedRoll;
    return result;
  },

  push_autocomplete_entries : function(key, entries) {
    if (!_(this.get('autocomplete')).has(key)) {
      this.get('autocomplete')[key] = [];
    }
    var entriesArray = entries.split(/,\s*/);
    entriesArray = _(entriesArray).chain().map(function(entry){
                    return entry.trim();
                   }).filter(function(entry){
                    // only save email addresses if they are valid ones
                    return (key != 'email' || entry.search(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/) != -1);
                   }).value();
    var self = this;
    self.get('autocomplete')[key] = _.union(self.get('autocomplete')[key], entriesArray);
  },

  hasAbility: function(ability){
    return this.get('additional_abilities') &&
      _.contains(this.get('additional_abilities'), ability);
  },

  isNotLoggedIn : function(){
    return this.get('anon');
  },

  isAnonymous : function(){
    return this.get('user_type') == libs.shelbyGT.UserModel.USER_TYPE.anonymous;
  },

  trackSessionCount : function(onSuccess){
    var _url = shelby.config.apiRoot + '/user/' + this.id + '/visit';
    $.ajax(_url, {
      type: 'PUT',
      success: onSuccess
    });
  },

  //return an array of the services for which the user does not have authentication
  getUnauthedServices : function(){
    var userAuthentications = this.get('authentications');
    if (userAuthentications && userAuthentications.length) {
      return _(shelby.config.services.primaryAuth).reject(function(service){
        return _(userAuthentications).any(function(auth){
          return auth.provider == service;
        });
      });
    } else {
      return shelby.config.services.primaryAuth;
    }

  }

});

libs.shelbyGT.UserModel.USER_TYPE = {
  real : 0,
  faux : 1,
  converted : 2,
  service : 3,
  anonymous : 4
};