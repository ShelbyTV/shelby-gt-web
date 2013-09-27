/* Load this script using conditional IE comments if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'icomoon\'">' + entity + '</span>' + html;
	}
	var icons = {
			'icon-whole' : '&#xe000;',
			'icon-type' : '&#xe001;',
			'icon-mark' : '&#xe002;',
			'icon-twitter' : '&#xe003;',
			'icon-tumblr' : '&#xe004;',
			'icon-thumbnail' : '&#xe005;',
			'icon-star' : '&#xe006;',
			'icon-sound-on' : '&#xe007;',
			'icon-sound-off' : '&#xe008;',
			'icon-shortlink' : '&#xe009;',
			'icon-share' : '&#xe00a;',
			'icon-search' : '&#xe00b;',
			'icon-roll' : '&#xe00c;',
			'icon-play' : '&#xe00d;',
			'icon-pause' : '&#xe00e;',
			'icon-like' : '&#xe00f;',
			'icon-like-2' : '&#xe010;',
			'icon-hd' : '&#xe011;',
			'icon-guide-out' : '&#xe012;',
			'icon-guide-in' : '&#xe013;',
			'icon-facebook' : '&#xe014;',
			'icon-embed' : '&#xe015;',
			'icon-email' : '&#xe016;',
			'icon-dislike' : '&#xe017;',
			'icon-close' : '&#xe018;',
			'icon-chevron' : '&#xe019;',
			'icon-check' : '&#xe01a;',
			'icon-carrot' : '&#xe01b;',
			'icon-avatar' : '&#xe01c;',
			'icon-arrow_up' : '&#xe01d;',
			'icon-arrow_right' : '&#xe01e;',
			'icon-arrow_left' : '&#xe01f;',
			'icon-arrow_down' : '&#xe020;'
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