
var path = require('path'),
	lib = require('../includes/lib.js');

module.exports = (function(req,res) {
	
	var self = this;
	this.search = null;
	
	var searchModel = require('../models/search.js')(req,res);
	
	this.init = function() {
		
		self.getData(function() {
			
			renderData();
		});
		function renderData() {
			
			self.renderData(function() {
				// finished
			});
		}
	}
	
	// Data Retrieval
	
	this.getData = function(callback) {
		
		var dataSelf = this;
		
		// Get Search
		
		dataSelf.getDataSearch = function(callback) {
			
			searchModel.getSearch(function() {
				
				self.search = searchModel.search[0];
				callback();
			});
		}
		
		dataSelf.getDataSearch(callback);
		
	}
	this.renderData = function(callback) {
		
		var searchTitle = String(self.search.title);
		if (searchTitle == '') {
			searchTitle = 'Not Set. Please paste an autotrader.com search results URL in the box below and click Update.';
		}
		var searchURL = String(self.search.url);
		
		// Render Template
		
		res.render('settings', {
			"searchTitle" : searchTitle,
			"searchURL" : searchURL,
			"activeNav" : lib.getActiveNav('settings')
		});
		callback();
	}
	
	return this;
});