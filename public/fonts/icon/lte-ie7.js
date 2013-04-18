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
			'icon-videocard_roll' : '&#xe003;',
			'icon-videocard_queue' : '&#xe004;',
			'icon-videocard_comment' : '&#xe005;',
			'icon-trending' : '&#xe006;',
			'icon-star' : '&#xe007;',
			'icon-social_twitter' : '&#xe008;',
			'icon-social_tumblr' : '&#xe009;',
			'icon-social_facebook' : '&#xe00a;',
			'icon-shortlink' : '&#xe00b;',
			'icon-share' : '&#xe00c;',
			'icon-search' : '&#xe00d;',
			'icon-player_sound_on' : '&#xe00e;',
			'icon-player_sound_off' : '&#xe00f;',
			'icon-player_play' : '&#xe010;',
			'icon-player_pause' : '&#xe011;',
			'icon-player_fullscreen_enable' : '&#xe012;',
			'icon-player_fullscreen_disable' : '&#xe013;',
			'icon-missing_thumb' : '&#xe014;',
			'icon-iphone' : '&#xe015;',
			'icon-heart' : '&#xe016;',
			'icon-HD' : '&#xe017;',
			'icon-embed' : '&#xe018;',
			'icon-email' : '&#xe019;',
			'icon-comment_reply' : '&#xe01a;',
			'icon-chevron' : '&#xe01b;',
			'icon-carrot' : '&#xe01c;',
			'icon-cancel' : '&#xe01d;',
			'icon-avatar' : '&#xe01e;',
			'icon-arrow_up' : '&#xe01f;',
			'icon-arrow_right' : '&#xe020;',
			'icon-arrow_left' : '&#xe021;',
			'icon-arrow_down' : '&#xe022;'
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