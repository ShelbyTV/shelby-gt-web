// code from from Three.js

shelby.fullScreen	= shelby.fullScreen || {};

/**
 * test if it is possible to have fullscreen
 * 
 * @returns {Boolean} true if fullscreen API is available, false otherwise
*/
shelby.fullScreen.available	= function(){
	return this._hasWebkitFullScreen || this._hasMozFullScreen;
};

/**
 * test if fullscreen is currently activated
 * 
 * @returns {Boolean} true if fullscreen is currently activated, false otherwise
*/
shelby.fullScreen.activated	= function(){
	if( this._hasWebkitFullScreen ){
		return document.webkitIsFullScreen;
	}else if( this._hasMozFullScreen ){
		return document.mozFullScreen;
	}else{
		console.assert(false);
	}
};

/**
 * Request fullscreen on a given element
 * @param {DomElement} element to make fullscreen. optional. default to document.body
*/
shelby.fullScreen.request	= function(element){
	element	= element	|| document.body;
	if( this._hasWebkitFullScreen ){
		element.webkitRequestFullScreen();
	}else if( this._hasMozFullScreen ){
		element.mozRequestFullScreen();
	}else{
		console.assert(false);
	}
};

/**
 * Cancel fullscreen
*/
shelby.fullScreen.cancel = function(){
	if( this._hasWebkitFullScreen ){
		document.webkitCancelFullScreen();
	}else if( this._hasMozFullScreen ){
		document.mozCancelFullScreen();
	}else{
		console.assert(false);
	}
};

shelby.fullScreen._hasWebkitFullScreen	= 'webkitCancelFullScreen' in document	? true : false;	
shelby.fullScreen._hasMozFullScreen	= 'mozCancelFullScreen' in document	? true : false;