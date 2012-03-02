//  Underscore.inflection.js
//  (c) 2011 Jeremy Ruppel
//  Underscore.inflection is freely distributable under the MIT license.
//  Portions of Underscore.inflection are inspired or borrowed from ActiveSupport
//  Version 1.0.0

( function( _, undefined )
{
  /**
   * Inflector
   */
  var inflector = {};
    
  inflector.plurals = [ ],

  inflector.singulars = [ ],

  inflector.uncountables = [ ],

  inflector.gsub = function( word, rule, replacement )
  {
    var pattern = new RegExp( rule.source || rule, 'gi' );

    return pattern.test( word ) ? word.replace( pattern, replacement ) : null;
  },

  inflector.plural = function( rule, replacement )
  {
    inflector.plurals.unshift( [ rule, replacement ] );
  },

  inflector.pluralize = function( word, count, includeNumber )
  {
    var result;
    
    if( count !== undefined )
    {
      result = ( count === 1 ) ? inflector.singularize( word ) : inflector.pluralize( word );
      result = ( includeNumber ) ? [ count, result ].join( ' ' ) : result;
    }
    else
    {
      if( _( inflector.uncountables ).include( word ) )
      {
        return word;
      }

      result = word;

      _( inflector.plurals ).detect( function( rule )
      {
        var gsub = inflector.gsub( word, rule[ 0 ], rule[ 1 ] );

        return gsub ? ( result = gsub ) : false;
      },
      inflector );
    }
    
    return result;
  },

  inflector.singular = function( rule, replacement )
  {
    inflector.singulars.unshift( [ rule, replacement ] );
  },

  inflector.singularize = function( word )
  {
    if( _( inflector.uncountables ).include( word ) )
    {
      return word;
    }

    var result = word;

    _( inflector.singulars ).detect( function( rule )
    {
      var gsub = inflector.gsub( word, rule[ 0 ], rule[ 1 ] );

      return gsub ? ( result = gsub ) : false;
    },
    inflector );

    return result;
  },

  inflector.irregular = function( singular, plural )
  {
    inflector.plural( singular, plural );
    inflector.singular( plural, singular );
  },

  inflector.uncountable = function( word )
  {
    inflector.uncountables.unshift( word );
  },

  inflector.resetInflections = function( )
  {
    inflector.plurals      = [ ];
    inflector.singulars    = [ ];
    inflector.uncountables = [ ];

    inflector.plural( /$/,                         's'       );
    inflector.plural( /s$/,                        's'       );
    inflector.plural( /(ax|test)is$/,              '$1es'    );
    inflector.plural( /(octop|vir)us$/,            '$1i'     );
    inflector.plural( /(octop|vir)i$/,             '$1i'     );
    inflector.plural( /(alias|status)$/,           '$1es'    );
    inflector.plural( /(bu)s$/,                    '$1ses'   );
    inflector.plural( /(buffal|tomat)o$/,          '$1oes'   );
    inflector.plural( /([ti])um$/,                 '$1a'     );
    inflector.plural( /([ti])a$/,                  '$1a'     );
    inflector.plural( /sis$/,                      'ses'     );
    inflector.plural( /(?:([^f])fe|([lr])f)$/,     '$1$2ves' );
    inflector.plural( /(hive)$/,                   '$1s'     );
    inflector.plural( /([^aeiouy]|qu)y$/,          '$1ies'   );
    inflector.plural( /(x|ch|ss|sh)$/,             '$1es'    );
    inflector.plural( /(matr|vert|ind)(?:ix|ex)$/, '$1ices'  );
    inflector.plural( /([m|l])ouse$/,              '$1ice'   );
    inflector.plural( /([m|l])ice$/,               '$1ice'   );
    inflector.plural( /^(ox)$/,                    '$1en'    );
    inflector.plural( /^(oxen)$/,                  '$1'      );
    inflector.plural( /(quiz)$/,                   '$1zes'   );

    inflector.singular( /s$/,                                                            ''        );
    inflector.singular( /(n)ews$/,                                                       '$1ews'   );
    inflector.singular( /([ti])a$/,                                                      '$1um'    );
    inflector.singular( /((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/, '$1$2sis' );
    inflector.singular( /(^analy)ses$/,                                                  '$1sis'   );
    inflector.singular( /([^f])ves$/,                                                    '$1fe'    );
    inflector.singular( /(hive)s$/,                                                      '$1'      );
    inflector.singular( /(tive)s$/,                                                      '$1'      );
    inflector.singular( /([lr])ves$/,                                                    '$1f'     );
    inflector.singular( /([^aeiouy]|qu)ies$/,                                            '$1y'     );
    inflector.singular( /(s)eries$/,                                                     '$1eries' );
    inflector.singular( /(m)ovies$/,                                                     '$1ovie'  );
    inflector.singular( /(x|ch|ss|sh)es$/,                                               '$1'      );
    inflector.singular( /([m|l])ice$/,                                                   '$1ouse'  );
    inflector.singular( /(bus)es$/,                                                      '$1'      );
    inflector.singular( /(o)es$/,                                                        '$1'      );
    inflector.singular( /(shoe)s$/,                                                      '$1'      );
    inflector.singular( /(cris|ax|test)es$/,                                             '$1is'    );
    inflector.singular( /(octop|vir)i$/,                                                 '$1us'    );
    inflector.singular( /(alias|status)es$/,                                             '$1'      );
    inflector.singular( /^(ox)en/,                                                       '$1'      );
    inflector.singular( /(vert|ind)ices$/,                                               '$1ex'    );
    inflector.singular( /(matr)ices$/,                                                   '$1ix'    );
    inflector.singular( /(quiz)zes$/,                                                    '$1'      );
    inflector.singular( /(database)s$/,                                                  '$1'      );

    inflector.irregular( 'person', 'people'   );
    inflector.irregular( 'man',    'men'      );
    inflector.irregular( 'child',  'children' );
    inflector.irregular( 'sex',    'sexes'    );
    inflector.irregular( 'move',   'moves'    );
    inflector.irregular( 'cow',    'kine'     );

    _( 'equipment information rice money species series fish sheep jeans'.split( /\s+/ ) ).each( function( word )
    {
      inflector.uncountable( word );
    },
    inflector );

    return inflector;
  }

  /**
   * Underscore integration
   */
  _.mixin( inflector.resetInflections( ) );
  
} )( _ );
