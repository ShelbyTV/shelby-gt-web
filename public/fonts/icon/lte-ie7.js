/* Load this script using conditional IE comments if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'Shelby\'">' + entity + '</span>' + html;
	}
	var icons = {
			'icon-videocard_roll' : '&#xe000;',
			'icon-videocard_queue' : '&#xe001;',
			'icon-videocard_comment' : '&#xe002;',
			'icon-star' : '&#xe003;',
			'icon-social_twitter' : '&#xe004;',
			'icon-social_tumblr' : '&#xe005;',
			'icon-social_facebook' : '&#xe006;',
			'icon-shortlink' : '&#xe007;',
			'icon-share' : '&#xe008;',
			'icon-search' : '&#xe009;',
			'icon-player_sound_on' : '&#xe00a;',
			'icon-player_sound_off' : '&#xe00b;',
			'icon-player_play' : '&#xe00c;',
			'icon-player_pause' : '&#xe00d;',
			'icon-player_fullscreen_enable' : '&#xe00e;',
			'icon-player_fullscreen_disable' : '&#xe00f;',
			'icon-missing_thumb' : '&#xe010;',
			'icon-iphone' : '&#xe011;',
			'icon-heart' : '&#xe012;',
			'icon-HD' : '&#xe013;',
			'icon-embed' : '&#xe014;',
			'icon-email' : '&#xe015;',
			'icon-comment_reply' : '&#xe016;',
			'icon-chevron' : '&#xe017;',
			'icon-carrot' : '&#xe018;',
			'icon-cancel' : '&#xe019;',
			'icon-avatar' : '&#xe01a;',
			'icon-arrow_up' : '&#xe01b;',
			'icon-arrow_right' : '&#xe01c;',
			'icon-arrow_left' : '&#xe01d;',
			'icon-arrow_down' : '&#xe01e;',
			'icon-whole' : '&#xe01f;',
			'icon-type' : '&#xe020;',
			'icon-mark' : '&#xe021;'
		},
		els = document.getElementsByTagName('*'),
		i, attr, html, c, el;
	for (i = 0; i < els.length; i += 1) {
		el = els[i];
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