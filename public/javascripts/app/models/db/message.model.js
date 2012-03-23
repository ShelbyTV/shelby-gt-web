libs.shelbyGT.MessageModel = Backbone.RelationalModel.extend({

  getText : function(){
    var regex = new RegExp(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi);
    var urls;
    if (urls = regex.exec(this.get('text'))) {
      return this.get('text').split(urls[0]).join('');
    } else {
      return this.get('text');
    }
  }

});
