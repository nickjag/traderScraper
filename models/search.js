
module.exports = (function(req,res) {
	
	var self = this;
	this.search = null;
	req.db.get('search').options.upsert = true;
	this.tsSearches = req.db.get('search');
	
	this.getSearch = function(callback) {
		
		self.tsSearches.find({},{}, function(e, docs){
			self.search = docs;
			callback();
		});
	}
	this.updateSearch = function(newSearch, callback) {
		
		self.tsSearches.update({},{title:newSearch.title, url:newSearch.url}, function(e, result){
			callback();
		});
	}
	
	return this;
});