libs.shelbyGT.MessageModel = libs.shelbyGT.ShelbyBaseModel.extend({

  url : function(){
    return shelby.config.apiRoot + '/conversation/'+this.get('conversation_id')+'/messages';
  }

});
