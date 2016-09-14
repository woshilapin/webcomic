import $ from 'jquery';
import JSZip from 'jszip';
import JSZipUtils from 'jszip-utils';

export class Comic {
	constructor(cbz) {
		this._cbz = cbz;
		this._infos = undefined;
	};
	infos() {
		var comic = this;
		return new Promise(function(resolve, reject) {
			if (comic._infos !== undefined) {
				resolve(comic._infos);
			} else {
				comic._cbz.file('ComicInfo.xml').async('string').then(function(xml) {
					comic._infos = {};
					var xmlinfos = $.parseXML(xml);
					var $xmlinfos = $(xmlinfos);
					comic._infos.title = $xmlinfos.find('Series').text();
					comic._infos.summary = $xmlinfos.find('Summary').text();
					resolve(comic._infos);
				}, function(error) {
					reject(error);
				});
			}
		});
	};
	strip(pagenumber) {
		var comic = this;
		return new Promise(function(resolve, reject) {
			var strips = comic._cbz.file(/[0-9]+/);
			if (pagenumber < 0 || pagenumber >= strips.length) {
				reject(new Error('Invalid page number'));
			}
			var strip = strips[pagenumber];
			if (JSZip.support.blob && URL.createObjectURL) {
				strip.async('blob').then(function (blob) {
					var url = URL.createObjectURL(blob);
					resolve(url);
				}, function(error) {
					reject(error);
				});
			} else {
				// No support of blob, fallback to base64 encoding of the file
				strip.async('base64').then(function(base64) {
					var url = 'data:image/jpeg;base64,' + base64;
					resolve(url);
				}, function(error) {
					reject(error);
				});
			}
		});
	};
}
