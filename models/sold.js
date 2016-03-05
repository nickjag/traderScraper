
var lib = require('../includes/lib.js');

module.exports = (function(req,res) {
	
	var self = this;
	this.sold = null;
	this.tsSold = req.db.get('sold');
	
	this.getSold = function(callback) {
		
		var pastDate = ((Math.floor(Date.now() / 1000)) - 7776000); // Date minus 3 months
		
		self.tsSold.find({date_taken:{$gt:pastDate}},{sort:{price:1}},function(e,docs){
			self.sold = docs;
			callback();
		});
	}
	
	this.insertSold = function(data, callback) {
		
		var days = lib.getDaysListed(data.start);
		
		self.tsSold.insert({date_taken:data.start, price:data.price, days:days}, function(e, result) {
			callback();
		});
	}
	
	this.clearAllSoldDocs = function(callback) {
		
		self.tsSold.remove({}, function(e, result) {
			callback();
		});
	}
	
	return this;
});