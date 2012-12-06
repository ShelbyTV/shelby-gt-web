//mixin the underscore.string functions we want so they can be used with underscore's OO syntax
_.mixin({
  capitalize: _.str.capitalize,
  clean: _.str.clean
});