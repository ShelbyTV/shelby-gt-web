/* Load this script using conditional IE comments if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'Shelby-Icon-Font\'">' + entity + '</span>' + html;
	}
	var icons = {
			'icon-twitter' : '&#xe000;',
			'icon-tumblr' : '&#xe001;',
			'icon-thumbnail' : '&#xe002;',
			'icon-sound-on' : '&#xe003;',
			'icon-sound-off' : '&#xe004;',
			'icon-shortlink' : '&#xe005;',
			'icon-share' : '&#xe006;',
			'icon-search' : '&#xe007;',
			'icon-roll' : '&#xe008;',
			'icon-play' : '&#xe009;',
			'icon-pause' : '&#xe00a;',
			'icon-like' : '&#xe00b;',
			'icon-chevron' : '&#xe00c;',
			'icon-carrot' : '&#xe00d;',
			'icon-avatar' : '&#xe00e;',
			'icon-arrow_up' : '&#xe00f;',
			'icon-arrow_right' : '&#xe010;',
			'icon-arrow_left' : '&#xe011;',
			'icon-arrow_down' : '&#xe012;',
			'icon-whole' : '&#xe013;',
			'icon-type' : '&#xe014;',
			'icon-mark' : '&#xe015;',
			'icon-hd' : '&#xe016;',
			'icon-guide-out' : '&#xe017;',
			'icon-guide-in' : '&#xe018;',
			'icon-facebook' : '&#xe019;',
			'icon-embed' : '&#xe01a;',
			'icon-email' : '&#xe01b;',
			'icon-close' : '&#xe01c;'
		},
		els = document.getElementsByTagName('*'),
		i, attr, html, c, el;
	for (i = 0; ; i += 1) {
		el = els[i];
		if(!el) {
			break;
		}
		attr = el.getAttribute('data-icon');
		if (attr) {
			addIcon(el, attr);
		}
		c = el.className;
		c = c.match(/icon-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
};