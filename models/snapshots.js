
var settings = require('../includes/settings.js');

module.exports = (function(req,res) {
	
	var self = this;
	this.snapshots = null;
	this.tsSnapshots = req.db.get('snapshots');
	
	this.getSnapshots = function(callback, period) {
		
		self.tsSnapshots.find({},{sort:{date_taken:1},limit:period},function(e,docs){
			self.snapshots = docs;
			callback();
		});
	}
	
	this.insertSnapshot = function(data, callback) {
		
		self.tsSnapshots.insert({
			avg_price:data.avgPrice,
			date_taken:data.startDate,
			listings:data.numListings
		}, function(e, result) {
			callback();
		});
	}
	
	this.clearAllSnapshotsDocs = function(callback) {
		
		self.tsSnapshots.remove({}, function(e, result) {
			callback();
		});
	}
	
	return this;
});