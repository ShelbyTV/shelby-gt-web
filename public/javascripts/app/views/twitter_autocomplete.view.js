libs.shelbyGT.TwitterAutocompleteView = libs.shelbyGT.AutocompleteView.extend({

  options : _.extend({}, libs.shelbyGT.AutocompleteView.prototype.options, {
    separator : /[^\w@]/,
    source : function () {
      if (_(shelby.models.user.get('autocomplete')).has('twitter')) {
        return shelby.models.user.get('autocomplete').twitter;
      } else {
        return [];
      }
    }
  }),

  qualifier : function () {
    return this.query.length > 1 && this.query.indexOf('@') == 0;
  },

  queryTransformer : function () {
    // chop the @ off the beginning of twitter screen name since it needs to match
    // against screen names coming from the twitter api which don't have @ in them
    this.query = this.query.slice(1);
  },

  matchTransformer : function (match) {
    //put the @ back on the beginning of the screen name
    return '@' + match;
  }

});