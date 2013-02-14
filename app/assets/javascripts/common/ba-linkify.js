/*!
 * JavaScript Linkify - v0.4 - 11/16/2012
 * https://github.com/farneman/javascript-linkify
 *
 * Forked from work by Michael Mahemoff & Eli Ellis:
 * https://github.com/mahemoff/javascript-linkify
 * https://github.com/eliellis/javascript-linkify
 *
 * Based on the original work by "Cowboy" Ben Alman:
 * http://benalman.com/projects/javascript-linkify/
 *
 * Copyright (c) 2009 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 *
 * Some regexps adapted from http://userscripts.org/scripts/review/7122
 */

// Script: JavaScript Linkify: Process links in text!
//
// *Version: 0.3, Last updated: 6/27/2009*
//
// Project Home - http://benalman.com/projects/javascript-linkify/
// GitHub       - http://github.com/cowboy/javascript-linkify/
// Source       - http://github.com/cowboy/javascript-linkify/raw/master/ba-linkify.js
// (Minified)   - http://github.com/cowboy/javascript-linkify/raw/master/ba-linkify.min.js (2.8kb)
//
// About: License
//
// Copyright (c) 2009 "Cowboy" Ben Alman,
// Dual licensed under the MIT and GPL licenses.
// http://benalman.com/about/license/
//
// About: Examples
//
// This working example, complete with fully commented code, illustrates one way
// in which this code can be used.
//
// Linkify - http://benalman.com/code/projects/javascript-linkify/examples/linkify/
//
// About: Support and Testing
//
// Information about what browsers this code has been tested in.
//
// Browsers Tested - Internet Explorer 6-8, Firefox 2-3.7, Safari 3-4, Chrome, Opera 9.6-10.
//
// About: Release History
//
// 0.3 - (6/27/2009) Initial release

// Function: linkify
//
// Turn text into linkified html.
//
// Usage:
//
//  > var html = linkify( text [, options ] );
//
// Arguments:
//
//  text - (String) Non-HTML text containing links to be parsed.
//  options - (Object) An optional object containing linkify parse options.
//
// Options:
//
//  callback (Function) - If specified, this will be called once for each link-
//    or non-link-chunk with two arguments, text and href. If the chunk is
//    non-link, href will be omitted. If unspecified, the default linkification
//    callback is used.
//  punct_regexp (RegExp) - A RegExp that will be used to trim trailing
//    punctuation from links, instead of the default. If set to null, trailing
//    punctuation will not be trimmed.
//
// Returns:
//
//  (String) An HTML string containing links.

(function() {

  var linkify = (function(){

    var
      SCHEME = "[a-z\\d.-]+://",
      IPV4 = "(?:(?:[0-9]|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.){3}(?:[0-9]|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])",
      HOSTNAME = "(?:(?:[^\\s!@#$%^&*()_=+[\\]{}\\\\|;:'\",.<>/?]+)\\.)+",
      TLD = "(?:ac|ad|ae|aero|af|ag|ai|al|am|an|ao|aq|ar|arpa|as|asia|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|biz|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cat|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|com|coop|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|info|int|io|iq|ir|is|it|je|jm|jo|jobs|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mo|mobi|mp|mq|mr|ms|mt|mu|museum|mv|mw|mx|my|mz|na|name|nc|ne|net|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|post|pr|pro|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|travel|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xn--0zwm56d|xn--11b5bs3a9aj6g|xn--3e0b707e|xn--45brj9c|xn--80akhbyknj4f|xn--80ao21a|xn--90a3ac|xn--9t4b11yi5a|xn--clchc0ea0b2g2a9gcd|xn--deba0ad|xn--fiqs8s|xn--fiqz9s|xn--fpcrj9c3d|xn--fzc2c9e2c|xn--g6w251d|xn--gecrj9c|xn--h2brj9c|xn--hgbk6aj7f53bba|xn--hlcj6aya9esc7a|xn--j6w193g|xn--jxalpdlp|xn--kgbechtv|xn--kprw13d|xn--kpry57d|xn--lgbbat1ad8j|xn--mgb9awbf|xn--mgbaam7a8h|xn--mgbayh7gpa|xn--mgbbh1a71e|xn--mgbc0a9azcg|xn--mgberp4a5d4ar|xn--mgbx4cd0ab|xn--o3cw4h|xn--ogbpf8fl|xn--p1ai|xn--pgbs0dh|xn--s9brj9c|xn--wgbh1c|xn--wgbl6a|xn--xkc2al3hye2a|xn--xkc2dl3a5ee0h|xn--yfro4i67o|xn--ygbi2ammx|xn--zckzah|xxx|ye|yt|za|zm|zw)"
      HOST_OR_IP = "(?:" + HOSTNAME + TLD + "|" + IPV4 + ")",
      PATH = "(?:[;/][^#?<>\\s]*)?",
      QUERY_FRAG = "(?:\\?[^#<>\\s]*)?(?:#[^<>\\s]*)?",
      URI1 = "\\b" + SCHEME + "[^<>\\s]+",
      URI2 = "\\b" + HOST_OR_IP + PATH + QUERY_FRAG + "(?!\\w)",

      MAILTO = "mailto:",
      EMAIL = "(?:" + MAILTO + ")?[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@" + HOST_OR_IP + QUERY_FRAG + "(?!\\w)",

      URI_RE_LIST = [URI1, URI2, EMAIL],
      SCHEME_RE = new RegExp( "^" + SCHEME, "i" ),

      quotes = {
        "'": "`",
        '>': '<',
        ')': '(',
        ']': '[',
        '}': '{',
        '»': '«',
        '›': '‹'
      },

      default_options = {
        callback: function( text, href, options ) {
          return href ? '<a href="' + encodeURI(href) + '" title="' + encodeURI(href) + '"' +
                        buildAttribsString(options ? options.attribs : '') + '>' + text + '</a>' : text;
        },
        punct_regexp: /(?:[!?.,:;'"]|(?:&|&amp;)(?:lt|gt|quot|apos|raquo|laquo|rsaquo|lsaquo);)$/,
        twitter: false,
        attribs: {}
      };

    return function( txt, options ) {
      options = options || {};

      if (options.twitter) URI_RE_LIST.push("@[a-zA-Z0-9_]+");

      URI_RE = new RegExp( "(?:" + URI_RE_LIST.join("|") + ")", "ig" );

      // Temp variables.
      var arr,
        i,
        link,
        href,

        // Output HTML.
        html = '',

        // Store text / link parts, in order, for re-combination.
        parts = [],

        // Used for keeping track of indices in the text.
        idx_prev,
        idx_last,
        idx,
        link_last,

        // Used for trimming trailing punctuation and quotes from links.
        matches_begin,
        matches_end,
        quote_begin,
        quote_end;

      // Initialize options.
      for ( i in default_options ) {
        if ( options[ i ] === undefined ) {
          options[ i ] = default_options[ i ];
        }
      }

      // Find links.
      while ( arr = URI_RE.exec( txt ) ) {

        link = arr[0];
        idx_last = URI_RE.lastIndex;
        idx = idx_last - link.length;

        // Not a link if preceded by certain characters.
        if ( /[\/:]/.test( txt.charAt( idx - 1 ) ) ) {
          continue;
        }

        // Trim trailing punctuation.
        do {
          // If no changes are made, we don't want to loop forever!
          link_last = link;

          quote_end = link.substr( -1 )
          quote_begin = quotes[ quote_end ];

          // Ending quote character?
          if ( quote_begin ) {
            matches_begin = link.match( new RegExp( '\\' + quote_begin + '(?!$)', 'g' ) );
            matches_end = link.match( new RegExp( '\\' + quote_end, 'g' ) );

            // If quotes are unbalanced, remove trailing quote character.
            if ( ( matches_begin ? matches_begin.length : 0 ) < ( matches_end ? matches_end.length : 0 ) ) {
              link = link.substr( 0, link.length - 1 );
              idx_last--;
            }
          }

          // Ending non-quote punctuation character?
          if ( options.punct_regexp ) {
            link = link.replace( options.punct_regexp, function(a){
              idx_last -= a.length;
              return '';
            });
          }
        } while ( link.length && link !== link_last );

        href = link;

        // Add appropriate protocol to naked links.
        if (options.twitter && href.indexOf( '@' ) == 0)
            href = 'http://twitter.com/' + href.substr(1);
        else if ( !SCHEME_RE.test( href ) ) {
          href = ( href.indexOf( '@' ) !== -1 ? ( !href.indexOf( MAILTO ) ? '' : MAILTO )
            : !href.indexOf( 'irc.' ) ? 'irc://'
            : !href.indexOf( 'ftp.' ) ? 'ftp://'
            : 'http://' )
            + href;
        }

        // Push preceding non-link text onto the array.
        if ( idx_prev != idx ) {
          parts.push([ txt.slice( idx_prev, idx ), null ]);
          idx_prev = idx_last;
        }

        // Push massaged link onto the array
        parts.push([ link, href ]);
      };

      // Push remaining non-link text onto the array. But only if there is
      // somethign to push (ie. no links in given text).
      if ( txt ) {
        parts.push([ txt.substr( idx_prev ), null ]);
      }

      // Process the array items.
      for ( i = 0; i < parts.length; i++ ) {
        html += options.callback.apply( null, parts[i].concat(options) );
      }

      // In case of catastrophic failure, return the original text;
      return html || txt;
    };

    function buildAttribsString(attribs) {
      var s=" ";
      for (var key in attribs)
        s+= key + '="' + attribs[key] + '" ';
      return s.replace(/ $/,'')
    }

  })();

  (typeof(window)=='undefined') ? module.exports = linkify : window.linkify = linkify;

})();