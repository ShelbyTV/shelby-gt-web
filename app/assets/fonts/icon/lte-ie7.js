/* Load this script using conditional IE comments if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'icomoon\'">' + entity + '</span>' + html;
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
			'icon-hd' : '&#xe00c;',
			'icon-guide-out' : '&#xe00d;',
			'icon-guide-in' : '&#xe00e;',
			'icon-facebook' : '&#xe00f;',
			'icon-embed' : '&#xe010;',
			'icon-email' : '&#xe011;',
			'icon-close' : '&#xe012;',
			'icon-chevron' : '&#xe013;',
			'icon-check' : '&#xe014;',
			'icon-carrot' : '&#xe015;',
			'icon-avatar' : '&#xe016;',
			'icon-arrow_up' : '&#xe017;',
			'icon-arrow_right' : '&#xe018;',
			'icon-arrow_left' : '&#xe019;',
			'icon-arrow_down' : '&#xe01a;',
			'icon-whole' : '&#xe01b;',
			'icon-type' : '&#xe01c;',
			'icon-mark' : '&#xe01d;',
			'icon-star' : '&#xe01e;'
		},
		els = document.getElementsByTagName('*'),
		i, attr, c, el;
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