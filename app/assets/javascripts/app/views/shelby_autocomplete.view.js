libs.shelbyGT.ShelbyAutocompleteView = libs.shelbyGT.AutocompleteView.extend({

  options : _.extend({}, libs.shelbyGT.AutocompleteView.prototype.options, {
    includeSources : ['email', 'twitter', 'facebook', 'shelby'],
    shelbySource : []
  }),

  initialize : function () {
    // we need to be more inclusive about what we'll try to autocomplete if we're looking for email addresses
    this.options.separator =
      _(this.options.includeSources).include('email') ? /[^\w@.!#$%&'*+\-/=?^`{|}~]/ : /[^\w@]/;
    this._lookingForAtReplies = _(this.options.includeSources).any(function(source) { return source != 'email';})
    this._lookingForEmails = _(this.options.includeSources).contains('email');

    libs.shelbyGT.AutocompleteView.prototype.initialize.call(this);
  },

  qualifier : function () {
    var qualifies = false;
    this.options.source = []

    if (this.query.length > 1) {
      // all sources other than email require a leading '@' to trigger autocomplete
      if (this._lookingForAtReplies && this.query.indexOf('@') == 0) {
        qualifies = true;
        if (_(this.options.includeSources).contains('twitter') &&
            _(shelby.models.user.get('autocomplete')).has('twitter')) {
          this.options.source = this.options.source.concat(shelby.models.user.get('autocomplete').twitter);
        }
        if (_(this.options.includeSources).contains('facebook') &&
            _(shelby.models.user.get('autocomplete')).has('facebook')) {
          this.options.source = this.options.source.concat(shelby.models.user.get('autocomplete').facebook);
        }
        if (_(this.options.includeSources).contains('shelby')) {
          this.options.source = this.options.source.concat(_(this.options).result('shelbySource'));
        }
      } else if (this._lookingForEmails && this.query.indexOf('@') > 0) {
        qualifies = true;
        if (_(shelby.models.user.get('autocomplete')).has('email')) {
          this.options.source = this.options.source.concat(shelby.models.user.get('autocomplete').email);
        }
      }
    }
    return qualifies;
  },

  queryTransformer : function () {
    this._queryTransformed = false;

    // chop the @ off the beginning @replies since they need to match against the actual name string
    // which does not contain an @
    if (this.query[0] == '@') {
      this.query = this.query.slice(1);
      this._queryTransformed = true;
    }
  },

  matchTransformer : function (match) {
    if (this._queryTransformed) {
      // put the @ on the beginning of a screen name to make it an @reply
      return '@' + match;
    } else {
      return match;
    }
  }

});