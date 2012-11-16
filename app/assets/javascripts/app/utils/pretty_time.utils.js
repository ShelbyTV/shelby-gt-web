/** this should be moved elsewhere, like app_view_helper.js **/
function prettyTime(h, m, s){
  h = h || 0
  m = m || 0
  s = s || 0
	if(h > 0){
		timeStr = h + ":";
		m < 10 ? timeStr += "0"+m+":" : timeStr += m+":";
	} else {
		timeStr = m+":";
	}
	s < 10 ? timeStr += "0"+s : timeStr += s;
	return timeStr;
}