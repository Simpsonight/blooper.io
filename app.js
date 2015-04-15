// This is the server-side file of our app.
// It initializes socket.io and get a new express instance which is defined in server.js
// Start it by running 'node app.js' from your terminal.

var server = require('./server.js'),
	io = server.socket;


// Websocket

// devices which are currently connected
var devices = {};
var numDevices = 0;

// Initialize a new socket.io application

var blopper = io.on('connection', function (socket) {

	var addedDevice = false;

	// When the client emits 'add device', this listens and executes.
	// We store the devicename in the socket session for this client
	// and add the client's devicename to the global list

	socket.on('add device', function (devicename) {

		console.log('device connected');

		socket.devicename = devicename;
		devices[devicename] = devicename;
		++numDevices;
		addedDevice = true;

		socket.emit('login', {
			numDevices: numDevices,
			devices: devices
		});

		// Echo globally (all clients) that a device has connected

		socket.broadcast.emit('device joined', {
			devicename: socket.devicename,
			numDevices: numDevices,
			devices: devices
		});
	});


	// When the device disconnects.. perform this
	// If addedDevice is true, delete the device from the global list
	
	socket.on('disconnect', function () {

		console.log('device disconnected');

		// remove the devicename from global devices list
		if (addedDevice) {
			delete devices[socket.devicename];
			--numDevices;

			// Echo globally that this client has left
			
			socket.broadcast.emit('device left', {
				devicename: socket.devicename,
				numDevices: numDevices,
				devices: devices
			});
		}
	});

	// When we type into the input, update the value
	// on the connected devices, too
	socket.on('type url', function (value) {
		console.log('typing');
		socket.broadcast.emit('show typing', value);
	});

	socket.on('new url', function (value) {
		console.log('new url');
		socket.broadcast.emit('update iframe', value);
	});


});