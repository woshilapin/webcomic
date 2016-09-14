export {Comic as default};

import $ from 'jquery';
import JSZip from 'jszip';
import JSZipUtils from 'jszip-utils';

class Comic {
	constructor(path) {
		this._path = path;
		this._infos = undefined;
		this._cbz = undefined;
	}
	load() {
		return new Promise(function(resolve, reject) {
			JSZipUtils.getBinaryContent(this._path, function(err, data) {
				JSZip.loadAsync(data).then(function(cbz) {
					this._cbz = cbz;
					resolve(this);
				}, function(error) {
					reject(error)
				});
			});
		});
	}
	infos() {
		return new Promise(function(resolve, reject) {
			if (this._infos !== undefined) {
				resolve(this._infos);
			} else {
				this._cbz.file('ComicInfo.xml').async('string').then(function(xml) {
					this._infos = {};
					var xmlinfos = $.parseXML(xml);
					var $xmlinfos = $(xmlinfos);
					this._infos.title = $xmlinfos.find('Series').text();
					this._infos.summary = $xmlinfos.find('Summary').text();
					resolve(this._infos);
				}, function(error) {
					reject(error);
				});
			}
		});
	}
	strip(pagenumber) {
		return new Promise(function(resolve, reject) {
			var strips = this._cbz.file(/[0-9]+/);
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
	}
}
