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
            //find the channel which this hashtag refers to
            var channelKey = _(shelby.config.channels).chain().pairs().find(function(channelPair) {
              return _(channelPair[1].hashTags).contains(href.slice(1));
            }).value()[0];
            var linkAttributesString = ' ';
            if (_(options.hashtag_link_attribs).has('class')) {
              options.hashtag_link_attribs['class'] += ' js-hashtag-link';
            } else {
              options.hashtag_link_attribs['class'] = 'js-hashtag-link';
            }
            _(options.hashtag_link_attribs).chain().extend({
              'data-channel_key' : channelKey,
              'data-ga_label' : href,
              target : '_blank'
            }).each(function(value, name) {
              linkAttributesString += name + '="' + value + '" ';
              linkAttributesString = linkAttributesString.replace(/ $/,'');
            });
            return '<a href="/channels/' + channelKey + '" title="Go to channel ' + channelKey + '"' +
                            (options ? linkAttributesString : '') + '>' + text + '</a>';
          } else {
            //regular link, just do the same thing that the default callback does in ba-linkify
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
      hashtags : false,
      hashtag_link_attribs : {},
      hashtag_link_prefix : '',
      hashtag_link_postfix : '',
      hashtag_whitelist : null
    }).value();

    return linkify(s, options);
  },

  // linkifySafeWithClickTracking - wrapper for our linkifier that specifies
  // adding attributes to each link so that they can be tracked by GA
  linkifySafeWithClickTracking : function(s, trackingOptions, linkifyOptions){
    // default options
    var defaults = {
      link : {
        gaCategory : 'Frame',
        gaAction : 'Click',
        gaLabel : shelby.models.user.get('nickname')
      },
      hashtag : {
        gaCategory : 'Frame',
        gaAction : 'Click on hashtag link'
      }
    };
    trackingOptions = $.extend(true, {}, defaults, trackingOptions);

    var attribs = {
      target: "blank",
      'class': "js-track-event"
    };
    attribs['data-ga_category'] = trackingOptions.link.gaCategory;
    attribs['data-ga_action'] = trackingOptions.link.gaAction;
    attribs['data-ga_label'] = trackingOptions.link.gaLabel;

    var hashtag_link_attribs = {
      'class': "js-track-event"
    };
    hashtag_link_attribs['data-ga_category'] = trackingOptions.hashtag.gaCategory;
    hashtag_link_attribs['data-ga_action'] = trackingOptions.hashtag.gaAction;

    // mix the link attributes for tracking in with any other link attributes specified
    // in the linkifyOptions params, which allows the caller to pass any additional
    // options to ba-linkify that they wish
    linkifyOptions = _({}).extend(linkifyOptions);
    linkifyOptions.attribs = _.chain({}).extend(linkifyOptions.attribs).extend(attribs).value();
    linkifyOptions.hashtag_link_attribs = _.chain({}).extend(linkifyOptions.hashtag_link_attribs).extend(hashtag_link_attribs).value();

    return this.linkifySafe(s, linkifyOptions);
  }

 };