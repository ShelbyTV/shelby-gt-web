var Browser = {

	isIframe: function(){
		if (parent.window !== window){ return true; }
		else { return false; }
	},
	
	isFacebook: function(){
		if (App.getCookie("facebook_app") === "true"){ return true; }
		else {return false;}
	},
	
	isChrome: function(){
		if (BrowserDetect.browser === "Chrome"){ return true; }
		else {return false;}
	},
	
	isIos: function(){
		if (navigator.platform.match(/^(iPad|iPod|iPhone)$/)){ return true; }
		else{ return false; }
	},
	
	isIpad: function(){
		if (navigator.platform.match(/^(iPad)$/)){ return true; }
		else{ return false; }
	},
	
	isMobile: function(){
		if (navigator.platform.match(/^(iPad|iPod|iPhone|Android)$/)){ return true; }
		else{ return false; }		
	},
	
	isBoxee: function(){
		if (window.boxee !== undefined){ return true; }
		else{ return false; }
	},
	
	isTV: function(){
		if (this.isBoxee()){ return true; }
		// OR GOOGLE TV??
		else{ return false; }
	},
	
	isSupported: function(){
		if( this.isBoxee() ){ return true; }
		
		switch(BrowserDetect.browser){
		case 'Chrome':
			return BrowserDetect.version >= 9;
		case 'Safari':
			return this.isIos() || BrowserDetect.version >= 5;
		case 'Firefox':
			return BrowserDetect.version >= 3.6;
		case 'Explorer':
			return BrowserDetect.version >= 9;
		case 'Mozilla':
			return BrowserDetect.version >= 5;
		case 'Android':
			return BrowserDetect.version >= 2.3;
		default:
			return false;
		}
	},
	
	//full app doesn't work well on iPhone and other small-screen devices like that
	//so we degrade to a simpler page
	supportsFullClient: function(){
		return (!this.isMobile() || this.isIpad());
	},
	
	supportsArbitraryFullscreen: function(){
		return (typeof document.webkitIsFullScreen != "undefined");
	},
	
	supportsAuthPopup: function(){
		return !(this.isBoxee() || this.isMobile() || this.isIframe());
	}
	
};


var BrowserDetect = {
	init: function () {
		this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
		this.version = this.searchVersion(navigator.userAgent)
			|| this.searchVersion(navigator.appVersion)
			|| "an unknown version";
		this.OS = this.searchString(this.dataOS) || "an unknown OS";
	},
	searchString: function (data) {
		for (var i=0;i<data.length;i++)	{
			var dataString = data[i].string;
			var dataProp = data[i].prop;
			this.versionSearchString = data[i].versionSearch || data[i].identity;
			if (dataString) {
				if (dataString.indexOf(data[i].subString) != -1)
					return data[i].identity;
			}
			else if (dataProp)
				return data[i].identity;
		}
	},
	searchVersion: function (dataString) {
		var index = dataString.indexOf(this.versionSearchString);
		if (index == -1) return;
		return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
	},
	dataBrowser: [
		{
			string: navigator.userAgent, //searches this string
			subString: "Chrome",         //for any occurance of this
			identity: "Chrome"           //returns this as the "browser"
		},
		{	string: navigator.userAgent,
			subString: "OmniWeb",
			versionSearch: "OmniWeb/",
			identity: "OmniWeb"
		},
		{
			string: navigator.vendor,
			subString: "Apple",
			identity: "Safari",
			versionSearch: "Version"
		},
		{
			prop: window.opera,
			identity: "Opera"
		},
		{
			string: navigator.vendor,
			subString: "iCab",
			identity: "iCab"
		},
		{
			string: navigator.vendor,
			subString: "KDE",
			identity: "Konqueror"
		},
		{
			string: navigator.userAgent,
			subString: "Firefox",
			identity: "Firefox"
		},
		{
			string: navigator.vendor,
			subString: "Camino",
			identity: "Camino"
		},
		{		// for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: "Netscape",
			identity: "Netscape"
		},
		{
			string: navigator.userAgent,
			subString: "Android",
			identity: "Android"
		},
		{
			string: navigator.userAgent,
			subString: "MSIE",
			identity: "Explorer",
			versionSearch: "MSIE"
		},
		{
			string: navigator.userAgent,
			subString: "Gecko",
			identity: "Mozilla",
			versionSearch: "rv"
		},
		{	// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: "Mozilla",
			identity: "Netscape",
			versionSearch: "Mozilla"
		}
	],
	dataOS : [
		{
			string: navigator.platform,
			subString: "Win",
			identity: "Windows"
		},
		{
			string: navigator.platform,
			subString: "Mac",
			identity: "Mac"
		},
		{
			string: navigator.userAgent,
			subString: "iPhone",
			identity: "iPhone/iPod"
		},
		{
			string: navigator.platform,
			subString: "Linux",
			identity: "Linux"
		}
	]
};