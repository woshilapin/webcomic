requirejs.config({
	"paths": {
		"jquery": "lib/jquery/dist/jquery",
		"jszip": "lib/jszip/dist/jszip",
		"jszip-utils": "lib/jszip-utils/dist/jszip-utils"
	}
});
requirejs(['jquery', 'jszip', 'jszip-utils'], function ($, JSZip, JSZipUtils) {
	var $progress = $('#content #progressbar');
	var $strip = $('#strip');
	var $metadata = $('#metadata');
	var $showhide = $('#show-hide');
	var $show = $showhide.find('#show');
	var $hide = $showhide.find('#hide');
	$metadata.hide();
	$show.show();
	$show.click(function(e) {
		$metadata.show();
		$showhide.css('right', '25em');
		$show.hide();
		$hide.show();
	});
	$hide.click(function(e) {
		$metadata.hide();
		$showhide.css('right', 0);
		$show.show();
		$hide.hide();
	});
	var updateProgressBar = function (meta) {
		var percent = meta.percent.toFixed(2);
		$progress.find('.progress-bar')
			.data('aria-valuenow', percent)
			.width(percent + "%");
		if (percent < 100) {
			$progress.show();
		} else {
			$progress.hide();
		}
	};
	var loadStrip = function (file, pageid) {
		var $img = $strip.find('#' + pageid + ' > img');
		$img.attr('alt', file.name);
		if (JSZip.support.blob && URL.createObjectURL) {
			file.async('blob', updateProgressBar).then(function (blob) {
				var url = URL.createObjectURL(blob);
				$img.attr('src', url);
			});
		} else {
			// No support of blob, fallback to base64 encoding of the file
			file.async('base64', updateProgressBar).then(function(base64) {
				$img.attr('src', 'data:image/jpeg;base64,' + base64);
			});
		}
	};
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
	var loadStrips = function (cbz, pagenumber) {
		var files = cbz.file(/[0-9]+/);
		if (pagenumber < 0 || pagenumber >= files.length) {
			return;
		} else {
			loadStrip(files[pagenumber], 'current-page');
			$('#current-page').data('pagenumber', pagenumber).data('pages', files.length);
			$('#previous-page > img').attr('src', '');
			$('#next-page > img').attr('src', '');
			if (pagenumber > 0) {
				loadStrip(files[pagenumber-1], 'previous-page');
			}
			if (pagenumber < files.length - 1) {
				loadStrip(files[pagenumber+1], 'next-page');
			}
		}
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
			console.log(objectPosition.join(' '));
			$strip.css('object-position', objectPosition.join(' '));
		});
	};
	JSZipUtils.getBinaryContent("comics/sunstone.vol-2.cbz", function(err, data) {
		var fileblob = data;
		JSZip.loadAsync(fileblob).then(function(cbz) {
			$(document).on('keydown', function (e) {
				var pagenumber = parseInt($('#current-page').data('pagenumber'));
				if (e.key === 'ArrowLeft' || e.key === 'h') {
					loadStrips(cbz, pagenumber-1);
					showPageNumber();
				} else if (e.key === 'ArrowRight' || e.key === 'l') {
					loadStrips(cbz, pagenumber+1);
					showPageNumber();
				} else if (e.key === ' ') {
					showPageNumber();
					zoom();
				}
			});
			cbz.file("ComicInfo.xml").async("string").then(function(xml) {
				var comicinfo = $.parseXML(xml);
				var $comicinfo = $(comicinfo);
				var $series = $comicinfo.find('Series');
				var $alternateseries = $comicinfo.find('AlternateSeries');
				var $summary = $comicinfo.find('Summary');
				var $metadata = $('#metadata');
				$metadata.find('#title').text($series.text());
				$metadata.find('#subtitle').text($alternateseries.text());
				$metadata.find('#summary').text($summary.text());
				var pagenumber = parseInt($('#current-page').data('pagenumber'));
				loadStrips(cbz, pagenumber);
			});
			var number = 0;
		});
	});
});
