
var lib = require('../includes/lib.js');

module.exports = {
	
	home: function(req, res) {
		
		var controller = require('../controllers/index.js')(req,res);
		controller.init();
	},
	update: function(req, res) {
		
		var controller = require('../controllers/update.js')(req,res);
		controller.init();
	},
	settings: function(req, res) {
		
		var controller = require('../controllers/settings.js')(req,res);
		controller.init();
	},
	about: function(req, res) {
		
		res.render('about', {
			"activeNav" : lib.getActiveNav('about')
		});
	},
	scrape: function(req, res) {
		
		var controller = require('../controllers/scrape.js')(req,res);
		controller.init();
	},
	process: function(req, res) {
		
		var controller = require('../controllers/process.js')(req,res);
		controller.init();
	},
	error: function(req, res) {
		
		res.status(404);
		res.render('error', {
			name: 'error'
		});
	}
};