
var path = require('path'),
	url = require('url'),
	lib = require('../includes/lib.js');

module.exports = (function(req,res) {
	
	var self = this;
	this.search = null;
	this.output = {};
	
	var searchModel = require('../models/search.js')(req,res);
	var scrapeModel = require('../models/scrape.js')(req,res);
	var dataModel = require('../models/data.js')(req,res);
	
	this.init = function() {
		
		self.getData(function() {
			scrapeSaveData();
		});
		function scrapeSaveData() {
			self.scrapeSaveData(function() {
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
		
		// get search
		
		dataSelf.getDataSearch = function(callback) {
			
			searchModel.getSearch(function() {
				self.search = searchModel.search[0];
				callback();
			});
		}
		
		dataSelf.getDataSearch(callback);
		
	}
	this.scrapeSaveData = function(callback) {
		
		var scrapeSelf = this;
		
		scrapeSelf.scrapeSaveInit = function(callback) {
			
			var initialURL = 'http://www.autotrader.com';
			
			if (scrapeModel.initScrape()) {
				
				scrapeModel.fetchURL(initialURL, false, function() {
					
					if (scrapeModel.responseSuccess) {
						
						scrapeSelf.scrapeSaveFetch(callback);
					}
					else {
						
						self.output.result = false;
						self.output.message = 'Could not fetch initial URL';
						callback();
					}
				});
			}
		}
		
		scrapeSelf.scrapeSaveFetch = function(callback) {
			
			scrapeModel.fetchURL(self.search.url, true, function() {
				
				if (scrapeModel.responseSuccess) {
					
					scrapeSelf.scrapeSaveTotal(callback);
				}
				else {
					self.output.result = false;
					self.output.message = 'Could not fetch provided URL';
					callback();
				}
			});
		}
		
		scrapeSelf.scrapeSaveTotal = function(callback) {
			
			scrapeModel.scrapeTotal(function() {
				
				var scrapeTotalResult = lib.validateTotalListings(scrapeModel.scrapeResults.totalListings);
				
				if (scrapeTotalResult.result) {
					
					self.output.result = true;
					scrapeSelf.scrapeAll(callback);
				}
				else {
					self.output.result = false;
					self.output.message = scrapeTotalResult.message;
					callback();
				}
				
			});
		}
		
		scrapeSelf.scrapeAll = function(callback) {
			
			// Scrape All Vehicles
			
			scrapeModel.scrapeVehicles(function() {
				
				// Commented Out -- AutoTrader doesn't count the standard listings in their total count, so it's unreliable.
				
				//if (parseInt(scrapeModel.scrapeResults.count) === parseInt(scrapeModel.scrapeResults.totalListings)) {
					
					// Update Data
					
					scrapeSelf.resetAll(callback);
					
				/*
				}
				else {
					self.output.result = false;
					self.output.message = 'Scrape Error: The scraped result did not match the number of listings.';
					callback();
				}
				*/
				
			});
			
		}
		
		scrapeSelf.resetAll = function(callback) {
			
			// Reset the updated field for all vehicles
			
			dataModel.resetData(function() {
				
				scrapeSelf.saveAll(callback);
			});
			
		}
		
		scrapeSelf.saveAll = function(callback) {
			
			// Update/save all vehicles
			
			var keys = Object.keys(scrapeModel.scrapeResults.vehicles);
			
			var vehiclesLeft = keys.length;
			
			keys.forEach(function(key) {
				
				dataModel.findUpdateData(scrapeModel.scrapeResults.vehicles[key], function() {
					
					if (--vehiclesLeft === 0) {
						
						self.output.result = true;
						self.output.message = 'updated successfully';
						callback();
					}
					
				});
			});
		}
		
		scrapeSelf.scrapeSaveInit(callback);
		
	}
	this.renderData = function(callback) {
		
		res.write(JSON.stringify(self.output));
		res.end();
		callback();
	}
	return this;
});