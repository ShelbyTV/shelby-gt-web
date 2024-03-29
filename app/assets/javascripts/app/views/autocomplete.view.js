( function(){

  var AutoCompleteDropDownView = Support.CompositeView.extend({

    events : {
      "click"         : "_onMenuClick",
      "mousedown"     : "_onMenuMouseDown",
      "mouseenter li" : "_onMenuItemMouseEnter"
    },

    _onMenuClick: function (e) {
        e.stopPropagation();
        e.preventDefault();
        this.parent.select();
    },

    _onMenuMouseDown: function (e) {
      // don't allow anything within the dropdown to get focus, since that
      // would cause blur to trigger on the input and the dropdown to prematurely
      // disappear
      e.stopPropagation();
      e.preventDefault();
    },

    _onMenuItemMouseEnter: function (e) {
      this.$('.active').removeClass('active');
      $(e.currentTarget).addClass('active');
    }
  });

  libs.shelbyGT.AutocompleteView = Support.CompositeBehaviorView.extend({

    _menu : null,

    _shown : false,

    options : {
      source: [],
      inputSelector : null, //if null, the view element itself is the input element
      items: 8,
      item: '<li><a href="#"></a></li>',
      menuTag : "ul",
      menuClass : "autocomplete-menu",
      multiTerm : false,
      multiTermMethod : 'list', //supported options: list, paragraph
      multiTermPosition : 'caret', //supported options: tail, caret
      separator : /[,;\s]+/,
      separatorReplacement : ", "
    },

    events : function() {
      var events = {
        "blur"     : "_onBlur",
        "keypress" : "_onKeypress",
        "keyup"    : "_onKeyup"
      };

      if ($.browser.webkit || $.browser.msie) {
        _(events).extend({
          "keydown" : "_onKeypress"
        });
      }

      if (this.options.inputSelector) {
        var self = this;
        _(events).map(function(value, key, obj){
          obj[key + " " + self.options.inputSelector] = value;
          delete obj[key];
        });
      }

      return events;
    },

    initialize : function() {
      this._$input = this.options.inputSelector ? this.$(this.options.inputSelector) : this.$el;
      this._input = this._$input[0];

      this._menu = new AutoCompleteDropDownView({
        className: this.options.menuClass + " fin fin--top_left fin--edging hidden js-autocomplete-menu",
        tagName : "ul"
      });
      this.renderChild(this._menu);
      this._$input.after(this._menu.el);
    },

    select : function () {
        var selection = this._menu.$('.active').attr('data-value');
        var newVal = selection;

        if (this.options.multiTerm) {
          switch (this.options.multiTermMethod) {
            case 'list':
              var terms = this.termsUpToQuery.concat(selection,this.termsAfterQuery,"");
              newVal = terms.join(this.options.separatorReplacement);
              break;
            case 'paragraph':
              newVal = this.textUpToQuery + selection + this.textAfterQuery;
              break;
          }
        }

        this._$input
          .val(this.updater(newVal))
          .change();

        if (this.options.multiTerm && this.options.multiTermPosition == 'caret') {
          switch (this.options.multiTermMethod) {
            case 'list':
              this._$input.setSelection(this.textUpToQuery.length + selection.length + this.options.separatorReplacement.length);
              break;
            case 'paragraph':
              this._$input.setSelection(this.textUpToQuery.length + selection.length);
              break;
          }
        }

        return this.hide();
    },

    updater : function (item) {
        return item;
    },

    show : function () {
        var pos = $.extend({}, this._$input.position(), {
          height: this._input.clientHeight
        });

        this._menu.$el.css({
          top: pos.top + pos.height,
          left: this._input.offsetLeft,
          width: this._input.offsetWidth //+2 compensates for border thickness
        });

        this._menu.$el.toggleClass('hidden',false);
        this._shown = true;
        return this;
    },

    hide : function () {
      this._menu.$el.toggleClass('hidden',true);
      this._shown = false;
      return this;
    },

    lookup : function (event) {
      var that = this,
          items,
          q;

      this.query = this._$input.val();

      if (this.options.multiTerm) {
        var stringToSearch;
        switch (this.options.multiTermPosition) {
          case 'tail':
            stringToSearch = this.query;
            break;
          case 'caret':
            var caretIndex = this._$input.getSelection().start;
            var includeAfterCaretIndex = this.query.slice(caretIndex).search(this.options.separator);
            if (includeAfterCaretIndex == -1) {
              stringToSearch = this.query;
            } else {
              stringToSearch = this.query.slice(0, caretIndex + includeAfterCaretIndex);
            }
            break;
        }
        var queryTerm;
        var queryAtIndex;
        switch (this.options.multiTermMethod) {
          case 'list':
            this.termsUpToQuery = stringToSearch.split(this.options.separator);
            queryTerm = this.termsUpToQuery.pop();
            if (queryTerm) {
              queryAtIndex = stringToSearch.lastIndexOf(queryTerm);
              this.textUpToQuery = this.query.slice(0, queryAtIndex);
              this.termsAfterQuery = _(this.query.slice(queryAtIndex + queryTerm.length).split(this.options.separator)).compact();
            }
            break;
          case 'paragraph':
            queryTerm = _(stringToSearch.split(this.options.separator)).last();
            if (queryTerm) {
              queryAtIndex = stringToSearch.lastIndexOf(queryTerm);
              this.textUpToQuery = this.query.slice(0, queryAtIndex);
              this.textAfterQuery = this.query.slice(queryAtIndex + queryTerm.length);
            }
            break;
        }
        this.query = queryTerm;
      }

      if (!this.query) {
        return this._shown ? this.hide() : this;
      }

      if (this.qualifier && !this.qualifier()) {
       return this._shown ? this.hide() : this;
      }

      if (this.queryTransformer) {
        this.queryTransformer();
      }

      items = $.grep(_(this.options).result('source'), function (item) {
        return that.matcher(item);
      });

      items = this.sorter(items);

      if (this.matchTransformer) {
        items = _(items).map(this.matchTransformer, this);
      }

      if (!items.length) {
        return this._shown ? this.hide() : this;
      }

      return this._renderAutoCompleteMenu(items.slice(0, this.options.items)).show();
    },

    // subclasses can override to determine whether the query qualifies for matching and optionally
    // update the matching data source for different kinds of queries
    // needs to be of the form function qualifier() returning true or false
    // and optionally updating this.options.source internally
    qualifier : null,

    // subclasses can override and transform the query arbitrarily before matching
    // needs to be of the form function queryTransformer() returning nothing and updating this.query internally
    queryTransformer : null,

    // subclasses can override and transform the matches arbitrarily before displaying
    // needs to be of the form function matchTransformer(matchedItem) returning the transformed match
    matchTransformer : null,

    matcher : function (item) {
      var itemLowerCase = item.toLowerCase();
      var queryLowerCase = this.query.toLowerCase();
      // don't match exactly equal strings if we are autocompleting multiple terms - it makes for bad UX
      return ~itemLowerCase.indexOf(queryLowerCase) && (!this.options.multiTerm || itemLowerCase != queryLowerCase);
    },

    sorter : function (items) {
      var beginswith = [],
          caseSensitive = [],
          caseInsensitive = [],
          item;

      while (item = items.shift()) {
        if (!item.toLowerCase().indexOf(this.query.toLowerCase())) beginswith.push(item);
        else if (~item.indexOf(this.query)) caseSensitive.push(item);
        else caseInsensitive.push(item);
      }

      return beginswith.concat(caseSensitive, caseInsensitive);
    },

    highlighter : function (item) {
      var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
      return item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
        return '<strong>' + match + '</strong>';
      });
    },

    _renderAutoCompleteMenu : function (items) {
      var that = this;

      items = $(items).map(function (i, item) {
        i = $(that.options.item).attr('data-value', item);
        i.find('a').html(that.highlighter(item));
        return i[0];
      });

      items.first().addClass('active');
      this._menu.$el.html(items);
      return this;
    },

    next: function (event) {
      var active = this._menu.$('.active').removeClass('active'),
          next = active.next();

      if (!next.length) {
        next = $(this._menu.$('li')[0]);
      }

      next.addClass('active');
    },

    prev: function (event) {
      var active = this._menu.$('.active').removeClass('active'),
          prev = active.prev();

      if (!prev.length) {
        prev = this._menu.$('li').last();
      }

      prev.addClass('active');
    },

    _onKeyup : function (e) {
        switch(e.keyCode) {
          case 40: // down arrow
          case 38: // up arrow
            break;

          case 9: // tab
          case 13: // enter
            if (!this._shown) return;
            this.select();
            break;

          case 27: // escape
            if (!this._shown) return;
            this.hide();
            break;

          default:
            this.lookup();
        }

        e.stopPropagation();
        e.preventDefault();
    },

    _onKeypress: function (e) {
      if (!this._shown) return;

      switch(e.keyCode) {
        case 9: // tab
        case 13: // enter
        case 27: // escape
          e.preventDefault();
          break;

        case 38: // up arrow
          if (e.type != 'keydown') break;
          e.preventDefault();
          this.prev();
          break;

        case 40: // down arrow
          if (e.type != 'keydown') break;
          e.preventDefault();
          this.next();
          break;
      }

      e.stopPropagation();
    },


    _onBlur: function (e) {
      var that = this;
      setTimeout(function () { that.hide(); }, 150);
    }

  });

} ) ();