/**
 * @license IndexChar, get the index of the given character in the specified alphabet.
 * *
 * neat little indexing trick inspiration: http://stackoverflow.com/a/9906256
 *
 * Copyright 2014, Michael Matyus
 * Version: 0
 */
(function($){
  $.charIndex = function(str,opts){
  //if default setting is a number, it must be the Index Character
  if(typeof(opts) === 'number') {
    opts = {indexChar:opts};
  }

  var settings = $.extend({}, $.charIndex.defaults, opts),
      glyph    = str.charAt(settings.indexChar).toUpperCase();

    return settings.scale.indexOf(glyph);
  };

  $.charIndex.defaults = {
    indexChar: 0,
    scale    :'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  };
}(jQuery));
