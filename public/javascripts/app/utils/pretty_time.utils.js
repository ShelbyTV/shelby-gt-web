/*
 * JavaScript Pretty Date
 * Copyright (c) 2008 John Resig (jquery.com)
 * Licensed under the MIT license.
 */

// Takes an ISO time and returns a string representing how
// long ago the date represents.
function prettyDate(time, adjustForTimezone){
	
	//iOS 4.3.4 requires date strings like "2011/07/19 20:20:20 " ...
	var date = new Date((time || "").replace(/-/g,"/").replace(/[TZ]/g," "));
	//var date = new Date((time || ""));
	
	if( adjustForTimezone ){
		date.setHours(date.getHours() - ((new Date()).getTimezoneOffset() / 60) );
	}
	
	var diff = (((new Date()).getTime() - date.getTime()) / 1000),
		day_diff = Math.floor(diff / 86400);

			
	if ( isNaN(day_diff) )
		return;
		
	return day_diff === 0 && (
			diff < 60 && "just now" ||
			diff < 120 && "1 minute ago" ||
			diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
			diff < 7200 && "1 hour ago" ||
			diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
		day_diff < 1 && "just now" ||
		day_diff == 1 && "yesterday" ||
		day_diff < 7 && day_diff + " days ago" ||
		day_diff < 14 && "last week" ||
		day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago" ||
		day_diff >= 31 && $.datepicker.formatDate('dd M yy', date);
}

// If jQuery is included in the page, adds a jQuery plugin to handle it as well
if ( typeof jQuery != "undefined" ) {
	jQuery.fn.prettyDate = function(){
		return this.each(function(){
			var date = prettyDate(this.title);
			if ( date )
				jQuery(this).text( date );
		});
	};
}



/** And some dspinosa added prettyTime stuff **/
function prettyTime(h, m, s){
	if(h > 0){
		timeStr = h + ":";
		m < 10 ? timeStr += "0"+m+":" : timeStr += m+":";
	} else {
		timeStr = m+":";
	}
	s < 10 ? timeStr += "0"+s : timeStr += s;
	return timeStr;
}