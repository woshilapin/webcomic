export class ComicBook {
	constructor(book) {
		/* Book is a structure that must expose:
		   - metadata() return Object with following fields:
		     * title
		     * summary
		     * number_of_pages
		   - strip(number) return a promise of a string that can be used in the 'src' of an '<img>'
		*/
		this._book = book;
		this._currentpage = 0;
	};
	get currentpage() {
		return this._currentpage;
	};
	set currentpage(number) {
		this._currentpage = number;
	};
	metadata() {
		return this._book.metadata();
	};
	strip(number) {
		return this._book.strip(number);
	};
}
