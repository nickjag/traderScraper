
var path = require('path'),
	url = require('url'),
	lib = require('../includes/lib.js');

module.exports = (function(req,res) {
	
	var self = this;
	this.url = null;
	this.output = {};
	
	var snapshotsModel = require('../models/snapshots.js')(req,res);
	var searchModel = require('../models/search.js')(req,res);
	var scrapeModel = require('../models/scrape.js')(req,res);
	var soldModel = require('../models/sold.js')(req,res);
	var dataModel = require('../models/data.js')(req,res);
	
	this.init = function() {
		
		self.getData(function() {
			clearAllData();
		});
		function clearAllData() {
			self.clearAllData(function() {
				saveData();
			});
		}
		function saveData() {
			self.saveData(function() {
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
		
		// Get URL
		
		dataSelf.getDataURL = function(callback) {
			
			if (req.body.url !== '') {
				
				self.url = req.body.url;
				dataSelf.getDataValidate(callback);
			}
			else {
				
				self.output.result = false;
				self.output.message = 'Please provide a valid autotrader.com search results URL';
				callback();
			}
		}
		dataSelf.getDataValidate = function(callback) {
			
			if (lib.validateURL(self.url)) {
				
				dataSelf.getDataSanitize(callback);
			}
			else {
				
				// Validation Error
				
				self.output.result = false;
				self.output.message = 'Please provide a valid autotrader.com search results URL';
				callback();
			}
		}
		dataSelf.getDataSanitize = function(callback) {
			
			// Sanitize
			
			self.url = lib.sanitizeURL(self.url);
			dataSelf.getDataScrape(callback);
		}
		dataSelf.getDataScrape = function(callback) {
			
			// Test Scrape
			
			self.scrapeTest(callback);
		}
		
		dataSelf.getDataURL(callback);
		
	}
	this.scrapeTest = function(callback) {
		
		var scrapeSelf = this;
		
		scrapeSelf.scrapeTestInit = function(callback) {
			
			var initialURL = 'http://www.autotrader.com';
			
			if (scrapeModel.initScrape()) {
				
				scrapeModel.fetchURL(initialURL, false, function() {
					
					if (scrapeModel.responseSuccess) {
						
						scrapeSelf.scrapeTestFetch(callback);
					}
					else {
						
						self.output.result = false;
						self.output.message = 'Could not fetch initial URL';
						callback();
					}
				});
			}
		}
		scrapeSelf.scrapeTestFetch = function(callback) {
			
			scrapeModel.fetchURL(self.url, true, function() {
				
				if (scrapeModel.responseSuccess) {
					
					scrapeSelf.scrapeTestTotal(callback);
				}
				else {
					self.output.result = false;
					self.output.message = 'Could not fetch provided URL';
					callback();
				}
			});
		}
		scrapeSelf.scrapeTestTotal = function(callback) {
			
			scrapeModel.scrapeTotal(function() {
				
				var scrapeTestResult = lib.validateTotalListings(scrapeModel.scrapeResults.totalListings);
				
				if (scrapeTestResult.result) {
					
					self.output.result = true;
					scrapeSelf.scrapeTestTitle(callback);
				}
				else {
					self.output.result = false;
					self.output.message = scrapeTestResult.message;
					callback();
				}
				
			});
		}
		scrapeSelf.scrapeTestTitle = function(callback) {
			
			scrapeModel.scrapeTitle(function() {
				
				if (scrapeModel.scrapeResults.title == '') {
					
					self.output.result = false;
					self.output.message = 'We could not find a valid search title on the URL provided.';
				}
				
				callback();
			});
		}
		
		scrapeSelf.scrapeTestInit(callback);
	}
	this.clearAllData = function(callback) {
		
		var selfClear = this;
		
		selfClear.clearSnapshots = function(callback) {
			
			snapshotsModel.clearAllSnapshotsDocs(function() {
				
				selfClear.clearSold(callback);
			});
		}
		selfClear.clearSold = function(callback) {
			
			soldModel.clearAllSoldDocs(function() {
				
				selfClear.clearData(callback);
			});
		}
		selfClear.clearData = function(callback) {
			
			dataModel.clearAllDataDocs(function() {
				
				callback();
			});
		}
		
		selfClear.clearSnapshots(callback);
	}
	this.saveData = function(callback) {
		
		if (self.output.result) {
			
			self.output.message = 'Your vehicle has been updated.';
			
			// Update URL and Title
			
			var newSearch = {
				title: scrapeModel.scrapeResults.title,
				url: self.url
			};
			
			searchModel.updateSearch(newSearch, callback);
		}
		else {
			
			callback();
		}
	}
	this.renderData = function(callback) {
		
		res.send(JSON.stringify(self.output));
		res.end();
		callback();
	}
	
	
	return this;
});