plugins = {};
plugins.funnel = require('broccoli-funnel');
plugins.merge = require('broccoli-merge-trees');
plugins.jshint = require('broccoli-jshint');
plugins.postcss = require('broccoli-postcss');
plugins.cssnano = require('broccoli-cssnano');
plugins.csslint = require('broccoli-csslint');

const src = 'src';

funnels = {
	html: {},
	css: {},
	js: {},
	misc: {}
};
///////
// HTML
funnels.html.original = plugins.funnel(src, {
	files: ['index.html']
});
funnels.html.final = funnels.html.original;
///////
// CSS
funnels.css.original = plugins.funnel(src, {
	srcDir: 'css',
	destDir: 'css'
});
// PostCSS
funnels.css.postcss = plugins.postcss(funnels.css.original, {
	plugins: [{
		module: require('postcss-cssnext'),
		options: {
			map: {
				inline: false
			}
		}
	}]
});
// CSSLint
funnels.css.csslint = plugins.csslint(funnels.css.postcss);
// CSSnano
funnels.css.final = plugins.cssnano(funnels.css.csslint, {
	safe: true,
	sourcemap: true
});
///////
// JS
funnels.js.original = plugins.funnel(src, {
	srcDir: 'js',
	destDir: 'js'
});
funnels.js.final = funnels.js.original;
///////
// Misc
funnels.misc.comics = plugins.funnel('comics', {
	destDir: 'comics'
});
funnels.misc.vendor = plugins.funnel('src', {
	srcDir: 'vendor',
	destDir: 'vendor'
});

module.exports = plugins.merge([
		funnels.html.final,
		funnels.css.final,
		funnels.js.final,
		funnels.misc.vendor,
		funnels.misc.comics
], 'Final merge');
