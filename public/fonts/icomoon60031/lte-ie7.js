/* Use this script if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'icomoon\'">' + entity + '</span>' + html;
	}
	var icons = {
			'icon-videocard_roll' : '&#xe000;',
			'icon-videocard_queue' : '&#xe001;',
			'icon-player_sound_off' : '&#xe002;',
			'icon-player_sound_on' : '&#xe003;',
			'icon-comment_reply' : '&#xe004;',
			'icon-chevron' : '&#xe005;',
			'icon-carrot' : '&#xe006;',
			'icon-player_play' : '&#xe007;',
			'icon-videocard_comment' : '&#xe008;',
			'icon-star' : '&#xe009;',
			'icon-player_pause' : '&#xe00a;',
			'icon-player_fullscreen_enable' : '&#xe00b;',
			'icon-social_twitter' : '&#xe00c;',
			'icon-social_tumblr' : '&#xe00d;',
			'icon-social_facebook' : '&#xe00e;',
			'icon-player_fullscreen_disable' : '&#xe00f;',
			'icon-avatar' : '&#xe010;',
			'icon-cancel' : '&#xe011;',
			'icon-missing_thumb' : '&#xe012;',
			'icon-iphone' : '&#xe013;',
			'icon-shortlink' : '&#xe014;',
			'icon-search' : '&#xe015;',
			'icon-email' : '&#xe016;',
			'icon-mark' : '&#xe01c;',
			'icon-type' : '&#xe017;',
			'icon-type-2' : '&#xe018;',
			'icon-type-3' : '&#xe019;'
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