plugins = {};
plugins.babel = require('broccoli-babel-transpiler');
plugins.browserify = require('broccoli-fast-browserify');
plugins.concat = require('broccoli-concat');
plugins.csslint = require('broccoli-csslint');
plugins.cssnano = require('broccoli-cssnano');
plugins.eslint = require('broccoli-lint-eslint');
plugins.funnel = require('broccoli-funnel');
plugins.jshint = require('broccoli-jshint');
plugins.merge = require('broccoli-merge-trees');
plugins.postcss = require('broccoli-postcss');

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
				inline: true
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
// ESlint
funnels.js.eslint = plugins.eslint(funnels.js.original, {
	options: {
		configFile: '.eslintrc'
	}
});
// Babel
funnels.js.babel = plugins.babel(funnels.js.eslint, {
	browserPolyfill: true,
	sourceMap: 'both'
});
funnels.js.browserify = plugins.browserify(funnels.js.babel, {
	bundles: {
		'js/webcomix.js': {
			entryPoints: ['./js/webcomix.js']
		}
	},
	browserify: {
		debug: true
	}
});
funnels.js.final = funnels.js.browserify;
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
