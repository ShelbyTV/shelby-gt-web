FrontEndModel = Backbone.Model.Extend({
	// for models that don't have a corresponding back-end model,
	// use 'defaults' to enumerate the attributes expected by our code,
	// even if there is no useful default value (then use null)
	defaults : {
		'attribute-with-no-useful-default' : null,
		'attribute-with-useful-integer-default' : 5,
		'attribute-with-useful-string-default' : 'string'
	}
});