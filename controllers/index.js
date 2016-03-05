
var path = require('path'),
	url = require('url'),
	settings = require('../includes/settings.js'),
	lib = require('../includes/lib.js')
	
module.exports = (function(req,res) {
	
	var self = this;
	this.search = null;
	this.snapshots = null;
	this.currAvgPrice = null;
	this.snapshotLabels = null;
	this.snapshotValues = null;
	this.soldLabels = null;
	this.soldValues = null;
	this.emptyData = false;
	
	this.output = {
		periodClassShort: 'primary',
		periodClassMax: 'default',
	};
	
	var snapshotsModel = require('../models/snapshots.js')(req,res);
	var searchModel = require('../models/search.js')(req,res);
	var soldModel = require('../models/sold.js')(req,res);
	
	this.init = function() {
		
		self.getSettings(function() {
			getData();
		});
		function getData() {
			self.getData(function() {
				prepareData();
			});
		}
		function prepareData() {
			self.prepareData(function() {
				processData();
			});
		}
		function processData() {
			self.processData(function() {
				renderData();
			});
		}
		function renderData() {
			self.renderData(function() {
				// finished
			});
		}
	}
	
	// Settings
	
	this.getSettings = function(callback) {
		
		// Check for settings
		
		if (req.method.toLowerCase() === 'get') {
			
			var query = url.parse(req.url, true).query;
			
			// Check for period
			
			if (query.period !== undefined && query.period == 'max') {
				settings.period = settings.maxPeriod;
				self.output.periodClassShort = 'default';
				self.output.periodClassMax = 'primary';
			}
			
			// Future Settings
		}
		
		callback();
	}
	
	// Data Retrieval
	
	this.getData = function(callback) {
		
		var dataSelf = this;
		
		// Get Search
		
		dataSelf.getDataSearch = function(callback) {
			
			searchModel.getSearch(function() {
				self.search = searchModel.search[0];
				dataSelf.getDataSnapshots(callback);
			});
		}
		
		// Get Snapshots
		
		dataSelf.getDataSnapshots = function(callback) {
			
			snapshotsModel.getSnapshots(function() {
				
				self.snapshots = snapshotsModel.snapshots;
				dataSelf.getDataSold(callback);
			});
		}
		
		// Get Sold
		
		dataSelf.getDataSold = function(callback) {
			
			soldModel.getSold(function() {
				
				self.sold = soldModel.sold;
				callback();
			});
		}
		
		dataSelf.getDataSearch(callback);
		
	}
	
	// Data Preparation
	
	this.prepareData = function(callback) {
		
		var dataSelf = this;
		
		dataSelf.prepareSearchData = function(callback) {
			
			// Check if there's any data yet
			
			if (self.snapshots.length === 0) {
				self.emptyData = true;
				callback();
			}
			else {
				dataSelf.prepareSnapshotData(callback);
			}
		}
		
		dataSelf.prepareSnapshotData = function(callback) {
			
			// Set current data
			
			var currSnapshot = self.snapshots[self.snapshots.length-1];
			self.currAvgPrice = currSnapshot.avg_price;
			self.currListings = currSnapshot.listings;
			
			// Set snapshot data
			
			var snapshotLabelsArr = [];
			var snapshotValuesArr = [];
			
			for (var key in self.snapshots) {
				
				var labelDate = String(lib.formatTimestamp(self.snapshots[key].date_taken));
				var labelNum = String(self.snapshots[key].listings);
				var valueAmt = lib.formatMoney(self.snapshots[key].avg_price);
				
				snapshotLabelsArr.push(labelDate);
				snapshotValuesArr.push(self.snapshots[key].avg_price);
			}
			
			self.snapshotLabels = "'" + snapshotLabelsArr.join("','") + "'";
			self.snapshotValues = "'" + snapshotValuesArr.join("','") + "'";
			
			dataSelf.prepareSoldData(callback);
		}
		
		dataSelf.prepareSoldData = function(callback) {
			
			// Set Sold data
			
			var soldLabelsArr = [];
			var soldValuesArr = [];
			
			// Loop through to break up listings into buckets of $5000s
			
			var priceSoldArr = [];
			var daysSoldArr = [];
			
			for (var key in self.sold) {
				
				var soldPrice = self.sold[key].price / 1000;
				var daysSold = self.sold[key].days;
				var priceKey = Math.round(soldPrice / (settings.priceDeviation / 1000));
				
				if (priceSoldArr[priceKey] !== undefined) {
					priceSoldArr[priceKey] ++;
					daysSoldArr[priceKey] += daysSold;
				}
				else {
					priceSoldArr[priceKey] = 1;
					daysSoldArr[priceKey] = daysSold;
				}
			}
			
			// Loop through pricesSoldArr to create labels and values
			
			var priceLabelArr = [];
			var daysValueArr = [];
			
			var priceHolder = settings.priceDeviation;
			var loop = 1;
			
			for (var key in priceSoldArr) {
				
				// Fill in the missing labels if there are any
				
				for (var i=1;i<=20;i++) {
					
					if ( (key !== loop) && (loop < key) ) {
						
						var priceLabel = lib.formatMoney(loop * settings.priceDeviation);
						var avgDaysSold = '';
						
						priceLabelArr.push(priceLabel);
						daysValueArr.push(avgDaysSold);
						
						loop++;
					}
					else {
						break;
					}
				}
				
				var priceLabel = lib.formatMoney(parseFloat(key) * settings.priceDeviation);
				var avgDaysSold = daysSoldArr[key] / priceSoldArr[key]; // sum of days divided by num of listings in bucket
				
				priceLabelArr.push(priceLabel);
				daysValueArr.push(avgDaysSold);
				
				loop++;
			}
			
			self.soldLabels = "'" + priceLabelArr.join("','") + "'";
			self.soldValues = "'" + daysValueArr.join("','") + "'";
			
			callback();
		}
		
		dataSelf.prepareSearchData(callback);
	}
	this.processData = function(callback) {
		
		callback();
	}
	this.renderData = function(callback) {
		
		if (!self.emptyData) {
			
			var searchTitle = String(self.search.title);
			var searchURL = String(self.search.url);
			
			// Render Template
			
			res.render('index', {
				"searchTitle" : searchTitle,
				"searchURL" : searchURL,
				"currAvgPrice" : lib.formatMoney(self.currAvgPrice),
				"currListings" : self.currListings,
				"snapshotLabels" : self.snapshotLabels,
				"snapshotValues" : self.snapshotValues,
				"soldLabels" : self.soldLabels,
				"soldValues" : self.soldValues,
				"periodClassShort" : self.output.periodClassShort,
				"periodClassMax" : self.output.periodClassMax,
				"activeNav" : lib.getActiveNav('index')
			});
		}
		else {
			
			// No data to display yet
			
			res.render('empty', {
				"activeNav" : lib.getActiveNav('index')
			});
		}
		
		callback();
	}
	
	return this;
});