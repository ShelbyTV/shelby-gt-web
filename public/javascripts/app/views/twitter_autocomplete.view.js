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
  }

});