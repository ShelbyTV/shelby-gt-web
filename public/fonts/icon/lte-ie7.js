/* Use this script if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'Shelby\'">' + entity + '</span>' + html;
	}
	var icons = {
			'icon-whole' : '&#xe000;',
			'icon-type' : '&#xe001;',
			'icon-mark' : '&#xe002;',
			'icon-videocard_roll' : '&#xe003;',
			'icon-videocard_queue' : '&#xe004;',
			'icon-videocard_comment' : '&#xe005;',
			'icon-star' : '&#xe006;',
			'icon-social_twitter' : '&#xe007;',
			'icon-social_tumblr' : '&#xe008;',
			'icon-social_facebook' : '&#xe009;',
			'icon-shortlink' : '&#xe00a;',
			'icon-search' : '&#xe00b;',
			'icon-player_sound_on' : '&#xe00c;',
			'icon-player_sound_off' : '&#xe00d;',
			'icon-player_play' : '&#xe00e;',
			'icon-player_pause' : '&#xe00f;',
			'icon-player_fullscreen_enable' : '&#xe010;',
			'icon-player_fullscreen_disable' : '&#xe011;',
			'icon-missing_thumb' : '&#xe012;',
			'icon-iphone' : '&#xe013;',
			'icon-heart' : '&#xe014;',
			'icon-HD' : '&#xe015;',
			'icon-email' : '&#xe016;',
			'icon-comment_reply' : '&#xe017;',
			'icon-chevron' : '&#xe018;',
			'icon-carrot' : '&#xe019;',
			'icon-cancel' : '&#xe01a;',
			'icon-avatar' : '&#xe01b;',
			'icon-arrow_up' : '&#xe01c;',
			'icon-arrow_right' : '&#xe01d;',
			'icon-arrow_left' : '&#xe01e;',
			'icon-arrow_down' : '&#xe01f;'
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