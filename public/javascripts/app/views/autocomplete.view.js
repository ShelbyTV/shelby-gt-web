libs.shelbyGT.AutoCompleteView = Support.CompositeBehaviorView.extend({

  _shown : false,

  options : {
    source: ['josh', 'jackson'],
    items: 8,
    item: '<li><a href="#"></a></li>',
    menuTag : "<ul>",
    menuClass : "autocomplete-menu",
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

    // wire up events for the autocomplete dropdown
    events["click .js-autocomplete-menu"] = "_onMenuClick";
    events["mouseenter .js-autocomplete-menu li"] = "_onMenuItemMouseEnter";
    
    return events;
  },

  initialize : function() {
    this.$menu = $(this.options.menuTag).addClass(this.options.menuClass).addClass("js-autocomplete-menu").appendTo(this.$el.offsetParent);
  },

  _cleanup : function() {
    this.$menu.remove();
  },

  select : function () {
      var val = this.$menu.find('.active').attr('data-value')
      this.$el
        .val(this.updater(val))
        .change()
      return this.hide()
  },

  updater : function (item) {
      return item
  },

  show : function () {
      var pos = $.extend({}, this.$el.offset(), {
        height: this.el.offsetHeight
      })

      this.$menu.css({
        top: pos.top + pos.height
      , left: pos.left
      })

      this.$menu.show()
      this._shown = true
      return this
  },

  hide : function () {
    this.$menu.hide()
    this._shown = false
    return this
  },

  lookup : function (event) {
    var that = this
      , items
      , q

    this.query = this.$el.val()

    if (!this.query) {
      return this._shown ? this.hide() : this
    }

    items = $.grep(this.options.source, function (item) {
      return that.matcher(item)
    })

    items = this.sorter(items)

    if (!items.length) {
      return this._shown ? this.hide() : this
    }

    return this._renderAutoCompleteMenu(items.slice(0, this.options.items)).show()
  },

  matcher : function (item) {
    return ~item.toLowerCase().indexOf(this.query.toLowerCase())
  },

  sorter : function (items) {
    var beginswith = []
      , caseSensitive = []
      , caseInsensitive = []
      , item

    while (item = items.shift()) {
      if (!item.toLowerCase().indexOf(this.query.toLowerCase())) beginswith.push(item)
      else if (~item.indexOf(this.query)) caseSensitive.push(item)
      else caseInsensitive.push(item)
    }

    return beginswith.concat(caseSensitive, caseInsensitive)
  },

  highlighter : function (item) {
    var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&')
    return item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
      return '<strong>' + match + '</strong>'
    })
  },

  _renderAutoCompleteMenu : function (items) {
    var that = this

    items = $(items).map(function (i, item) {
      i = $(that.options.item).attr('data-value', item)
      i.find('a').html(that.highlighter(item))
      return i[0]
    })

    items.first().addClass('active')
    this.$menu.html(items)
    return this
  },

  next: function (event) {
    var active = this.$menu.find('.active').removeClass('active')
      , next = active.next()

    if (!next.length) {
      next = $(this.$menu.find('li')[0])
    }

    next.addClass('active')
  },

  prev: function (event) {
    var active = this.$menu.find('.active').removeClass('active')
      , prev = active.prev()

    if (!prev.length) {
      prev = this.$menu.find('li').last()
    }

    prev.addClass('active')
  },

  _onKeyup : function (e) {
      switch(e.keyCode) {
        case 40: // down arrow
        case 38: // up arrow
          break

        case 9: // tab
        case 13: // enter
          if (!this._shown) return
          this.select()
          break

        case 27: // escape
          if (!this._shown) return
          this.hide()
          break

        default:
          this.lookup()
      }

      e.stopPropagation()
      e.preventDefault()
  },

  _onKeypress: function (e) {
    if (!this._shown) return

    switch(e.keyCode) {
      case 9: // tab
      case 13: // enter
      case 27: // escape
        e.preventDefault()
        break

      case 38: // up arrow
        if (e.type != 'keydown') break
        e.preventDefault()
        this.prev()
        break

      case 40: // down arrow
        if (e.type != 'keydown') break
        e.preventDefault()
        this.next()
        break
    }

    e.stopPropagation()
  },


  _onBlur: function (e) {
    var that = this
    setTimeout(function () { that.hide() }, 150)
  },

  _onMenuClick: function (e) {
      e.stopPropagation()
      e.preventDefault()
      this.select()
  },

  _onMenuItemMouseEnter: function (e) {
    this.$menu.find('.active').removeClass('active')
    $(e.currentTarget).addClass('active')
  }

});