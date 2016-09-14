import JSZip from 'jszip';
import JSZipUtils from 'jszip-utils';

export class CBZLoader {
	static load (path) {
		return new Promise(function (resolve, reject) {
			JSZipUtils.getBinaryContent(path, function(err, data) {
				JSZip.loadAsync(data).then(function(cbz) {
					resolve(cbz);
				}, function(error) {
					reject(error);
				});
			});
		});
	};
}
