libs.utils.String = {
  // sanitize a string for use as a url path segment
  toUrlSegment : function(s){
    // replace spaces and non-word characters with underscores
    return s.replace(/\s+|\W+/g, '-');
  },

  // linkifySafe - a wrapper for linkify, which wraps any urls in the string in <a>
  // tags that link to that url
  // Our wrapper allows us to:
  // 1) setup useful shelby default options for linkify
  // 2) escape html in the string that is NOT from our generated links
  linkifySafe : function(s, options){
    // default options
    options = _.chain({}).extend(options).defaults({
      attribs : {
        target : '_blank'
      }
    }).value();

    //our callback to linkify basically only does one additional thing:
    //html escape anything that isn't turned into a link
    options.callback = function( text, href, options ) {
      text = _.escape(text);
      if (href) {
        var s = " ";
        if (options) {
          for (var key in options.attribs) {
            s += key + '="' + options.attribs[key] + '" ';
          }
          s = s.replace(/ $/,'');
        }
        return '<a href="' + encodeURI(href) + '" title="' + encodeURI(href) + '"' +
                        (options ? s : '') + '>' + text + '</a>';
      } else {
        return text;
      }
    };

    return linkify(s, options);
  },

  // linkifySafeWithClickTracking - wrapper for our linkifier that specifies
  // adding attributes to each link so that they can be tracked by GA
  linkifySafeWithClickTracking : function(s, options){
    // default options
    options = _.chain({}).extend(options).defaults({
        gaCategory : 'Frame',
        gaAction : 'Click',
        gaLabel : shelby.models.user.get('nickname')
    }).value();

    var attribs = {
      target: "blank",
      'class': "js-track-event"
    };
    attribs['data-ga_category'] = options.gaCategory;
    attribs['data-ga_action'] = options.gaAction;
    attribs['data-ga_label'] = options.gaLabel;

    return this.linkifySafe(s, {attribs: attribs});
  }

 };