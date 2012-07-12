libs.shelbyGT.EmailAddressAutocompleteView = libs.shelbyGT.AutocompleteView.extend({

  options : _.extend({}, libs.shelbyGT.AutocompleteView.prototype.options, {
    source : function () {
      if (_(shelby.models.user.get('autocomplete')).has('email')) {
        return shelby.models.user.get('autocomplete').email;
      } else {
        return [];
      }
    }
  })

});