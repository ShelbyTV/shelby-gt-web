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
  // 3) optionally linkify shelby hashtags
  linkifySafe : function(s, options){
    // default options
    options = _.chain({}).extend(options).defaults({
      attribs : {
        target : '_blank'
      },
      callback : function( text, href, options ) {
        //html escape anything that isn't turned into a link
        text = _.escape(text);
        if (href) {
          if(href[0] == '#') {
            //special handling for hashtag links, which are not straight anchor links
            //but instead use javascript
            var linkAttributes = ' ';
            _(options.hashtag_link_attribs).each(function(value, name) {
              linkAttributes += name + '="' + value + '" ';
              linkAttributes = linkAttributes.replace(/ $/,'');
            });
            //find the channel which this hashtag refers to
            var channelKey = _(shelby.config.channels).chain().pairs().find(function(channelPair) {
              return _(channelPair[1].hashTags).contains(href.slice(1));
            }).value()[0];
            var jsLink = "javascript:shelby.router.navigate('/channels/" + channelKey + "', {trigger : true})";
            return '<a href="' + encodeURI(jsLink) + '" title="Go to channel ' + channelKey + '"' +
                            (options ? linkAttributes : '') + '>' + text + '</a>';
          } else {
            var s = " ";
            if (options) {
              for (var key in options.attribs) {
                s += key + '="' + options.attribs[key] + '" ';
              }
              s = s.replace(/ $/,'');
            }
            return '<a href="' + encodeURI(href) + '" title="Go to external link ' + encodeURI(href) + '"' +
                            (options ? s : '') + '>' + text + '</a>';
          }
        } else {
          return text;
        }
      },
      hashtags : true,
      hashtag_link_attribs : {},
      hashtag_link_prefix : '',
      hashtag_link_postfix : '',
      hashtag_whitelist : shelby.config.hashTags
    }).value();

    return linkify(s, options);
  },

  // linkifySafeWithClickTracking - wrapper for our linkifier that specifies
  // adding attributes to each link so that they can be tracked by GA
  linkifySafeWithClickTracking : function(s, trackingOptions, linkifyOptions){
    // default options
    trackingOptions = _.chain({}).extend(trackingOptions).defaults({
        gaCategory : 'Frame',
        gaAction : 'Click',
        gaLabel : shelby.models.user.get('nickname')
    }).value();

    var attribs = {
      target: "blank",
      'class': "js-track-event"
    };
    attribs['data-ga_category'] = trackingOptions.gaCategory;
    attribs['data-ga_action'] = trackingOptions.gaAction;
    attribs['data-ga_label'] = trackingOptions.gaLabel;

    // mix the link attributes for tracking in with any other link attributes specified
    // in the linkifyOptions params, which allows the caller to pass any additional
    // options to ba-linkify that they wish
    linkifyOptions = _({}).extend(linkifyOptions);
    linkifyOptions.attribs = _.chain({}).extend(linkifyOptions.attribs).extend(attribs).value();

    return this.linkifySafe(s, linkifyOptions);
  }

 };