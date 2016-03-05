
var path = require('path'),
	url = require('url'),
	lib = require('../includes/lib.js');

module.exports = (function(req,res) {
	
	var self = this;
	var dataSnapshots = null;
	var dataSold = null;
	this.output = {};
	
	var snapshotsModel = require('../models/snapshots.js')(req,res);
	var dataModel = require('../models/data.js')(req,res);
	var soldModel = require('../models/sold.js')(req,res);
	
	this.init = function() {
		
		self.getData(function() {
			processSnapshots();
		});
		function processSnapshots() {
			self.processSnapshots(function() {
				processSold();
			});
		}
		function processSold() {
			self.processSold(function() {
				renderData();
			});
		}
		function renderData() {
			self.renderData(function() {
				// finished
			});
		}
	}
	
	// Data Retrieval
	
	this.getData = function(callback) {
		
		var dataSelf = this;
		
		// Get data for snapshots
		
		dataSelf.getDataSnapshots = function(callback) {
			
			dataModel.findData(1, function() {
				
				self.dataSnapshots = dataModel.docs;
				dataSelf.getDataSold(callback);
			});
		}
		
		// Get data for sold
		
		dataSelf.getDataSold = function(callback) {
			
			dataModel.findData(0, function() {
				
				self.dataSold = dataModel.docs;
				callback();
			});
		}
		
		dataSelf.getDataSnapshots(callback);
		
	}
	
	this.processSnapshots = function(callback) {
		
		var processSelf = this;
		processSelf.processData = {};
		
		processSelf.createData = function(callback) {
			
			// Set snapshots variables
			
			processSelf.processData.startDate = Math.floor(Date.now() / 1000);
			processSelf.processData.numListings = self.dataSnapshots.length;
			
			// Loop through and create the average price
			
			var keys = Object.keys(self.dataSnapshots);
			var vehiclesLeft = keys.length;
			var totalPrice = 0;
			
			if (vehiclesLeft === 0) {
				
				callback();
			}
			else {
				
				keys.forEach(function(key) {
					
					totalPrice += self.dataSnapshots[key].price;
					
					if (--vehiclesLeft === 0) {
						processSelf.processData.avgPrice = Math.round(totalPrice / processSelf.processData.numListings);
						processSelf.saveSnapshot(callback);
					}
				});
			}
			
		}
		
		processSelf.saveSnapshot = function(callback) {
			snapshotsModel.insertSnapshot(processSelf.processData, function() {
				callback();
			});
		}
		
		processSelf.createData(callback);
		
	}
	
	this.processSold = function(callback) {
		
		var processSelf = this;
		processSelf.processData = {};
		
		processSelf.createData = function(callback) {
			
			// Loop through and insert into sold collection
			
			var keys = Object.keys(self.dataSold);
			var vehiclesLeft = keys.length;
			
			if (vehiclesLeft === 0) {
				
				callback();
			}
			else {
				
				keys.forEach(function(key) {
					
					soldModel.insertSold(self.dataSold[key], function() {
						
						if (--vehiclesLeft === 0) {
							processSelf.clearData(callback);
						}
					});
				});
			}
		}
		
		processSelf.clearData = function(callback) {
			
			dataModel.clearOldData(function() {
				
				self.output.result = true;
				self.output.message = 'processed successfully';
				callback();
			});
		}
		
		processSelf.createData(callback);
		
	}
	
	this.renderData = function(callback) {
		
		self.output.result = true;
		self.output.message = 'processed successfully';
		
		res.send(JSON.stringify(self.output));
		res.end();
		callback();
	}
	
	return this;
});