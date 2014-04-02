/*! jQuery.indexChar 2014-04-02 */
!function(a){a.indexChar=function(b,c){if("number"==typeof b)return void 0;if("number"==typeof c){if(b.length<=c)return void 0;c={indexChar:c}}var d=a.extend({},a.indexChar.defaults,c),e=b.charAt(d.indexChar).toUpperCase();return d.scale=d.scale.toUpperCase(),d.scale.indexOf(e)},a.indexChar.defaults={indexChar:0,scale:"ABCDEFGHIJKLMNOPQRSTUVWXYZ"}}(jQuery);
