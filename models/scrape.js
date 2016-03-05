
var cheerio = require('cheerio'),
	request = require('request'),
	lib = require('../includes/lib.js');

module.exports = (function(req,res) {
	
	var self = this;
	this.url = null;
	this.jar = null;
	this.options = {};
	this.responseBody = null;
	this.responseSuccess = false
	this.scrapeResults = {};
	
	this.initScrape = function() {
		
		self.jar = request.jar();
		return true;
	}
	this.setupRequest = function(url) {
		
		// Reset Response
		
		self.responseBody = null;
		self.responseSuccess = false;
		
		// Set the request options
		
		self.options.url = url;
		self.options.jar = self.jar;
		self.options.timeout = 15000;
		self.options.maxRedirect = 5;
		
		self.$ = null; // cheerio/jquery 
		
		return true;
	}
	
	this.fetchURL = function(url, keepBody, callback) {
		
		// Setup Request
		
		if (self.setupRequest(url)) {
			
			// Execute Request
			
			request(self.options, function (error, response, body) {
				
				if (!error && response.statusCode == 200) {
					
					self.responseSuccess = true;
					
					if (keepBody) {
						self.responseBody = body;
						self.prepareBody(callback);
					}
					else {
						callback();
					}
				}
				else {
					callback();
				}
			});
		}
		else {
			callback();
		}
	}
	this.prepareBody = function(callback) {
		
		self.$ = cheerio.load(self.responseBody);
		callback();
	}
	this.scrapeTotal = function(callback) {
		
		self.scrapeResults.totalListings = lib.cleanNumber(self.$('.num-listings').text());
		callback();
	}
	this.scrapeTitle = function(callback) {
		
		self.scrapeResults.title = self.$('.windowTitle_title').text();
		callback();
	}
	this.scrapeVehicles = function(callback) {
		
		self.scrapeResults.vehicles = [];
		
		var count = 0;
		
		self.$('.listing-isClickable').each(function() {
			
			self.scrapeResults.vehicles.push({
				id: lib.cleanNumber(self.$(this).attr('id')),
				price: lib.cleanNumber(self.$(this).find('.primary-price span').text())
			});
			
			count++;
		});
		
		self.scrapeResults.count = count;
		
		callback();
	}
	
	return this;
});