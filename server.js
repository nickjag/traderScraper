'use strict';

var express = require('express'),
	exphbs = require('express-handlebars'),
	router = require('./includes/router.js'),
	bodyParser = require('body-parser'),
	CronJob = require('cron').CronJob,
	request = require('request'),
	mongo = require('mongodb'),
	monk = require('monk'),
	http = require('http');

var app = express();

var appSettings = {
	domain: 'http://localhost:3000',
	timeZone: "America/New_York",
	port: 3000,
	dbConnection: 'localhost:27017/traderdb'
};

// Database Connection and Collection Setup

var db = monk(appSettings.dbConnection);

app.use(function(req,res,next){
	req.db = db;
	next();
});

db.get('search').find({},{}, function(e, docs) {
	if (docs.length < 1) {
		db.get('search').insert({title:'',url:''}, function(e, result) {});
	}
});

// Schedulers

function runScheduler(cron, path) {
	
	var schedule = new CronJob(cron, function() {
		
		var responseSuccess = false;
		
		var requestOptions = {
			timeout: 60000,
			url: appSettings.domain + path
		};
		
		request(requestOptions, function (e, res, body) {
			
			if (!e && res.statusCode == 200) {
				
				var resBody = JSON.parse(body);
				
				if ( (resBody.result !== undefined) && (resBody.result === true)) {
					
					responseSuccess = true;
				}
			}
		});
		
	}, null, true, appSettings.timeZone);
}

runScheduler('0 58 23 * * 0', '/scrape'); // Sunday night, 11:58pm
runScheduler('0 59 23 * * 0', '/process'); // Sunday night, 11:59pm


// Handlebars Templating

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

app.use('/public', express.static('public'));

// Encode URL parameters

app.use(bodyParser.urlencoded({ extended: false }))

// Routing

app.get('/favicon.ico', function(req, res) {
	res.end();
});

app.get('/', function(req, res) {
	router.home(req, res);
});

app.get('/settings', function(req, res) {
	router.settings(req, res);
});

app.post('/update', function(req, res) {
	router.update(req, res);
});

app.get('/about', function(req, res) {
	router.about(req, res);
});

app.get('/scrape', function(req, res) {
	router.scrape(req, res);
});

app.get('/process', function(req, res) {
	router.process(req, res);
});

app.use(function(req, res, next) {
	router.error(req, res);
});

// Listen

var port = Number(process.env.PORT || appSettings.port);

app.listen(port, function() {
	console.log('front-end server is running');
});