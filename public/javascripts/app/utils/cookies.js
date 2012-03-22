//---------------------------------------------------------
// Cookie Monster love cookie
//---------------------------------------------------------
var cookies = {
	set: function(name,value,expiredays){
		var exdate = new Date();
		exdate.setDate(exdate.getDate()+expiredays);
		document.cookie = name+ "=" +escape(value)+((expiredays===null) ? "" : ";expires="+exdate.toUTCString());
	},

	get: function(name){
		if (document.cookie.length>0) {
			c_start=document.cookie.indexOf(name + "=");
			if (c_start!=-1) {
				c_start = c_start + name.length+1;
				c_end = document.cookie.indexOf(";",c_start);
				if (c_end == -1) {c_end = document.cookie.length;}
				return unescape(document.cookie.substring(c_start,c_end));
			}
		}
		return "";
	}	
};
