var express = require('express');
var app = express();
var querystring = require("querystring");
var https = require('https');
var Hashes = require('jshashes');
var moment = require('moment');

var secret = "SECRET HERE";
var api = "API HERE";
var player = "PLAYER HERE";


app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.bodyParser({ keepExtensions:true, uploadDir: __dirname + '/public/downloads' }));
app.use(app.router);
app.use(express.static(__dirname + '/public'));

app.get('/select', function(req, res){
	res.render("select");
});

app.get('/statistics', function(req, res){
	var date = new Date();
	var ts = String(Math.round(date.getTime() / 1000) + date.getTimezoneOffset() * 30);
	var path = '';
	date.setDate(date.getDate()+1);
	var now = moment(date).format('YYYY-MM-DD');
	current_date = new Date();
	var monthDate = current_date.setMonth(current_date.getMonth()-1);
	var month = moment(monthDate).format('YYYY-MM-DD');
	path = 'analytics/reports/account/performance/videos/'+month+'...'+now;
	var sha = new Hashes.SHA256().b64(secret+'GET/v2/'+path+'api_key='+api+'expires='+ts).substr(0,43).replace(/=+$/,"");
	var signature = encodeURIComponent(sha);
	console.log('THE PATH: '+path);

	var done = function(gd) {
	  res.render("statistics",{gd:gd});    
  	}
  	graphData(res, signature, path, ts, done);

});

app.get('/channel', function(req, res){
	res.render("channel");
});

app.get('/label', function(req, res) {
	var date = new Date();
	var ts = String(Math.round(date.getTime() / 1000) + date.getTimezoneOffset() * 30);
	console.log('THE UNIX TIMESTAMP: '+ts);
	var path = '';
	date.setDate(date.getDate()+1);
	var now = moment(date).format('YYYY-MM-DD');
	var current_date = new Date();
	var weekDate = current_date.setDate(current_date.getDate()-8);
	var week = moment(weekDate).format('YYYY-MM-DD');
	current_date = new Date();
	var monthDate = current_date.setMonth(current_date.getMonth()-1);
	var month = moment(monthDate).format('YYYY-MM-DD');
	console.log('THE ID: '+req.query.id);
	switch (req.query.id) {
		case 'Player' :
			path = 'players/'+player;
			break;
		case 'Label' :
			path = 'labels';
			break;
		case 'N3bDU5bDqEvCppSTwy5C4hkeIevP6QNh' :
			path = 'analytics/reports/asset/'+req.query.id+'/engagement'
			break;
		case 'Weekly' :
			path = 'analytics/reports/account/performance/regions/'+week+'...'+now;
			console.log ('PATH: '+path);
			break;
		case 'Monthly' :
			path = 'analytics/reports/account/performance/regions/'+month+'...'+now;
			console.log ('PATH: '+path);
			break;
		case 'Mobile' :
			path = 'analytics/reports/account/performance/device_types/mobile/'+month+'...'+now;
			console.log ('PATH: '+path);
			break;
		case 'Desktop' :
			path = 'analytics/reports/account/performance/device_types/desktop/'+month+'...'+now;
			console.log ('PATH: '+path);
			break;
		case 'Videos' :
			path = 'analytics/reports/account/performance/videos/'+month+'...'+now;
			console.log ('PATH: '+path+'&limit=20');
			break;
		default :
			path = '';
	}
	var sha = new Hashes.SHA256().b64(secret+'GET/v2/'+path+'api_key='+api+'expires='+ts).substr(0,43).replace(/=+$/,"");
	var signature = encodeURIComponent(sha);
	console.log('THE SIGNATURE: '+signature);
	getLabel(res, signature, path, ts)
});

var getLabel = function(response, signature, path, ts) {
	var options = {
      host: 'api.ooyala.com',  
      port: 443,
      path: '/v2/'+path+'?api_key='+api+'&expires='+ts+'&signature='+signature,
      method: 'GET',
      };

    var req = https.request(options, function(res) {
      
         res.on('data', function(d) {
       		console.log("LABEL: "+d);
            response.render("select",{d:d});
            response.end();
     	});
          
    });
    req.end();
     
    req.on('error', function(e) {
    	console.log('ERROR BELOW');
    	console.error(e);
  	});
  	
 };

 var graphData = function(res, signature, path, ts, done) {
 	var graphData = {};
	graphData.cols = [];
	graphData.rows = [];
	graphData.cols[0] = {"Title":"","label":"VIDEO","type":"string"};
	graphData.cols[1] = {"id":"","label":"Count","type":"number"};
	var a = 0;

	var options = {
	  host: 'api.ooyala.com',  
	  port: 443,
	  path: '/v2/'+path+'?api_key='+api+'&expires='+ts+'&signature='+signature,
	  method: 'GET',
	  };

	var req = https.request(options, function(res) {
	  
	     res.on('data', function(d) {
	   		var data = JSON.parse(d);
	   		console.log("THE DATA: "+JSON.stringify(data));
	   		for (var i = 0; i < data.results.length; i++) {
	   			console.log("NAME: "+data.results[i].name+" PLAYS: "+data.results[i].metrics.video.plays);
	   			var name = data.results[i].name;
	   			var count = data.results[i].metrics.video.plays;
	   			graphData.rows[a] = {"c":[{"v":name,"f":null},{"v":count,"f":null},]}; 
	   			a++;
	   		}
	   		done(graphData);
	   		//res.end();
	 	});
	      
	});
	req.end();
	 
	req.on('error', function(e) {
		console.log('ERROR BELOW');
		console.error(e);
	});
  	
 };


app.listen(3000);
