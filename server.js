// Creating an express server
// Express initializes app to be a function handler that you can supply to an HTTP server

var express = require('express'),
	app = express(),
	http = require('http').createServer(app);

// Initialize a new instance of socket.io by passing the http (the HTTP server) object

var io = require('socket.io')(http);

// Make the io variable global

module.exports = { socket: io };

// Load the config file

var conf = require('./config.json');

// Set default local IP

var localIP = conf.ip;

// This is needed if the app is run on heroku and other cloud providers.
// For local server use the given port from the config.json 

var port = process.env.PORT || conf.port;

// Creating an object of the node os module
// to get the local network Interfaces

var os = require('os');
var ifaces = os.networkInterfaces();

// Find the local LAN/WLAN network IP

Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;

  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // Skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if (alias >= 1) {
      // This single interface has multiple ipv4 addresses
      console.log(ifname + ':' + alias, iface.address);
    } else {
      // This interface has only one ipv4 adress
      console.log(ifname, iface.address);
    }

    // override the global IP var
    localIP = iface.address;

  });
});

// We make the http server listen on the given port and the local network IP.

http.listen(port, localIP, function() {
  console.log('listening on ' + localIP + ':' + port );
});

// Routing
// Define public folder to deliver static files to the clients

app.use(express.static(__dirname + '/public'));

// We define a route handler / that gets called when we hit our website home.

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});



