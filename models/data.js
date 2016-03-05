
module.exports = (function(req,res) {
	
	var self = this;
	this.docs = null;
	
	req.db.get('data').options.multi = true;
	this.tsData = req.db.get('data');
	
	this.resetData = function(callback) {
		
		self.tsData.update({},{$set:{updated:0}},function(e, result){
			callback();
		});
	}
	
	this.findUpdateData = function(vehicleObj, callback) {
		
		self.tsData.update({vid:vehicleObj.id},{$set:{updated:1,price:vehicleObj.price}},function(e, result){
			
			if (result === 1) {
				callback();
			}
			else {
				
				// Insert the Vehicle
				
				self.insertVehicle(vehicleObj.id, vehicleObj.price, function() {
					callback();
				});
			}
		});
	}
	
	this.insertVehicle = function(vid,price,callback) {
		
		var startDate = Math.floor(Date.now() / 1000);
		self.tsData.insert({vid:vid, price:price, start:startDate, updated:1}, function(e, result) {
			callback();
		});
	}
	
	this.findData = function(updated, callback) {
		
		self.tsData.find({updated:updated},{}, function(e, docs) {
			
			self.docs = docs;
			callback();
		});
	}
	
	this.clearOldData = function(callback) {
		
		self.tsData.remove({updated:0}, function(e, result) {
			callback();
		});
	}
	
	this.clearAllDataDocs = function(callback) {
		
		self.tsData.remove({}, function(e, result) {
			callback();
		});
	}
	
	return this;
});