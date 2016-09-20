import $ from 'jquery';
import JSZip from 'jszip';
import JSZipUtils from 'jszip-utils';

export class CBZLoader {
	static load (path) {
		return new Promise(function (resolve, reject) {
			JSZipUtils.getBinaryContent(path, function(err, data) {
				JSZip.loadAsync(data).then(function(cbz) {
					resolve(new CBZ(cbz));
				}, function(error) {
					reject(error);
				});
			});
		});
	};
}

export class CBZ {
	constructor(cbz) {
		this._cbz = cbz;
		this._metadata = undefined;
		this._strip_files = this._cbz.file(/[0-9]+/);
		this._metadata_file = this._cbz.file('ComicInfo.xml');
	};
	metadata() {
		var t = this;
		return new Promise(function(resolve, reject) {
			if (t._metadata !== undefined) {
				resolve(t._metadata);
			} else {
				t._metadata_file.async('string').then(function(xml) {
					t._metadata = {};
					var xmlinfos = $.parseXML(xml);
					var $xmlinfos = $(xmlinfos);
					t._metadata.title = $xmlinfos.find('Series').text();
					t._metadata.summary = $xmlinfos.find('Summary').text();
					t._metadata.number_of_pages = t._strip_files.length;
					resolve(t._metadata);
				}, function(error) {
					reject(error);
				});
			}
		});
	};
	strip(number) {
		var t = this;
		return new Promise(function(resolve, reject) {
			var strips = t._strip_files;
			if (number < 0 || number >= strips.length) {
				reject(new Error('Invalid page number'));
			}
			var strip = strips[number];
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
