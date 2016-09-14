import $ from 'jquery';
import {CBZLoader} from './modules/CBZLoader.js';
import {Comic} from './modules/Comic.js';


$(document).ready(function() {
// var $progress = $('#content #progressbar');
var $strip = $('#strip');
var $metadata = $('#metadata');
var $showhide = $('#show-hide');
var $show = $showhide.find('#show');
var $hide = $showhide.find('#hide');
$metadata.hide();
$show.show();
$show.click(function() {
	$metadata.show();
	$showhide.css('right', '25em');
	$show.hide();
	$hide.show();
});
$hide.click(function() {
	$metadata.hide();
	$showhide.css('right', 0);
	$show.show();
	$hide.hide();
});
// var updateProgressBar = function (meta) {
// 	var percent = meta.percent.toFixed(2);
// 	$progress.find('.progress-bar')
// 		.data('aria-valuenow', percent)
// 		.width(percent + "%");
// 	if (percent < 100) {
// 		$progress.show();
// 	} else {
// 		$progress.hide();
// 	}
// };
var showPageNumber = function () {
	var $pagenumber = $('#pagenumber');
	var $currentpage = $('#current-page');
	var pagenumber = parseInt($currentpage.data('pagenumber')) + 1;
	var pages = parseInt($currentpage.data('pages'));
	$pagenumber.text(pagenumber + ' / ' + pages);
	$pagenumber.show();
	var fades = function() {
		$pagenumber.fadeOut(400);
	};
	setTimeout(fades, 1600);
};
var showPercentage = function (percentage) {
	var $percentage = $('#percentage');
	var p = Math.floor(percentage*100);
	$percentage.text(p + ' %');
	$percentage.show();
	var fades = function() {
		$percentage.fadeOut(400);
	};
	setTimeout(fades, 1600);
};
var loadStrips = function (comic, pagenumber) {
		comic.strip(pagenumber).then(function(imgsrc) {
			var $img = $strip.find('#current-page > img');
			$img.attr('src', imgsrc);
		});
		comic.strip(pagenumber-1).then(function(imgsrc) {
			var $img = $strip.find('#previous-page > img');
			$img.attr('src', imgsrc);
		});
		comic.strip(pagenumber+1).then(function(imgsrc) {
			var $img = $strip.find('#next-page > img');
			$img.attr('src', imgsrc);
		});
		$('#current-page').data('pagenumber', pagenumber).data('pages', 1000);
		$('#previous-page > img').attr('src', '');
		$('#next-page > img').attr('src', '');
};
var zoom = function () {
	var $page = $('#current-page');
	$page.toggleClass('full-screen');
	var $strip = $page.find('img');
	$strip.css('object-position', '0px 0px');
	var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	$(document).on('keydown', function(e) {
		var height = parseInt($strip.css('height'));
		var objectPosition = $strip.css('object-position').split(' ');
		var offset = Math.abs(parseInt(objectPosition[1]));
		var step = 100; // Increment for vertical scrolling in px
		var percent = offset/(height-viewportHeight);
		if (e.key === 'j' || e.key === 'ArrowDown') {
			if (offset + step > height - viewportHeight) {
				offset = height - viewportHeight;
			} else {
				offset += step;
			}
			showPercentage(percent);
		} else if (e.key === 'k' || e.key === 'ArrowUp') {
			if (offset - step < 0) {
				offset = 0;
			} else {
				offset -= step;
			}
			showPercentage(percent);
		} else if (e.key === 'h' || e.key === 'ArrowLeft' || e.key === 'l' || e.key === 'ArrowRight') {
			offset = 0;
		}
		objectPosition[1] = '-' + offset + 'px';
		$strip.css('object-position', objectPosition.join(' '));
	});
};
	CBZLoader.load("comics/sunstone.vol-4.cbz").then(function(cbz) {
		var comic = new Comic(cbz);
		loadStrips(comic, 0);
		$(document).on('keydown', function (e) {
			var pagenumber = parseInt($('#current-page').data('pagenumber'));
			if (e.key === 'ArrowLeft' || e.key === 'h') {
				loadStrips(comic, pagenumber-1);
				showPageNumber();
			} else if (e.key === 'ArrowRight' || e.key === 'l') {
				loadStrips(comic, pagenumber+1);
				showPageNumber();
			} else if (e.key === ' ') {
				showPageNumber();
				zoom();
			}
		});
		comic.infos().then(function(infos) {
			var $metadata = $('#metadata');
			$metadata.find('#title').text(infos.title);
			$metadata.find('#summary').text(infos.summary);
		});
	});
});
