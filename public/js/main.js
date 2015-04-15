$(function() {

	// Initialize variables
	var _ = {},
		$window = $(window),
		$gotoForm = $('#fm-goto'), 							// Form for goto action
		$gotoAddon = $gotoForm.find('.input-group-addon'),	// URL Prefix
		$gotoInput = $gotoForm.find('input[type=text]'),	// Input for goto action
		$devices = $('#devices').find('tbody'),				// List Wrapper to display connected devices
		$numDevices = $('#number-of-devices'),				// Holder for the amount of devices
		$locTrigger = $('#location-trigger'),				// Anker to trigger click event
		$syncWrapper = $('#sync-wrapper'),					// Container for the iframe
		$navbar = $('.navbar'),								// Navbar
		ua = navigator.userAgent,							// User Agent
		socket = io();										// Connect to the socket.io


	/**
	 * Socket Events
	 */

	// Tell the server your user agent
	socket.emit('add device', ua);

	// After first connect update client data
	socket.on('login', function (data) {
		console.log('login');
		_.updateNum(data);
		_.updateList(data);
	});

	// Whenever the server emits 'device joined', update the client's log
	socket.on('device joined', function (data) {
		console.log('joined');
		_.updateNum(data);
		_.updateList(data);
	});

	// Whenever the server emits 'device left', update the client's log
	socket.on('device left', function (data) {
		console.log('left');
		_.updateNum(data);
		_.updateList(data);
	});

	// Whenever the server emits 'show typing', update the $gotoInput field
	socket.on('show typing', function (value) {
		$gotoInput.val(value);
	});

	// Whenever the server emits 'update iframe', update the iframe wrapper
	socket.on('update iframe', function (value) {
		_.buildIframe(value);
		//_.loadURL(value);
	});

	/**
	 * Global Events
	 */

	$gotoInput.on('keyup', function (event) {
		var $self = $(this),
			value = $self.val();
		socket.emit('type url', value);
	});

	$gotoForm.on('submit', function (event) {
		event.preventDefault();
		socket.emit('new url', $gotoInput.val());
	});

	/**
	 * Build the log list of connected Devices
	 *
	 * @param data
	 */
	_.updateList = function (data) {
		// empty list
		$devices.empty();

		// go through all devices and get the given data
		$.each(data.devices, function(key, value) {

			var clientUA = _.parseUA(key),
				row = $('<tr>');

			$.each(clientUA, function (type, value) {
				var tbl = $('<td>');
				$.each(value, function (key, value) {
					if(value == undefined) value = '-';
					tbl.append('<span class="center-block text-center">' + value + '</span>');
					row.append(tbl);
				});
			});

			// append it
			$devices.append(row);
		});
	};

	/**
	 * Show the number of connections
	 *
	 * @param {object} data - the returned data object from the server
	 */
	_.updateNum = function (data) {
		$numDevices.text(data.numDevices);
	};

	/**
	 * Parse the userAgent String into an Object
	 * https://github.com/faisalman/ua-parser-js
	 *
	 * @param {string} client - the userAgent
	 * @returns {{browser: *, engine: *, os: *, device: *}}
	 */
	_.parseUA = function (client) {
		// New parser
		var parser = new UAParser(client),
			clientObj = {
				browser: parser.getBrowser(),
				engine: parser.getEngine(),
				os: parser.getOS(),
				device: parser.getDevice()
			}

		return clientObj;
	};

	_.buildIframe = function (url) {
		var iframe = $('<iframe frameborder="0" src="' + _.parseURL(url) + '" allowfullscreen>'),
			nHeight = $navbar.height(),
			nOuterHeight = $navbar.outerHeight(true),
			margin = nOuterHeight - nHeight,
			wHeight = $(window).height() - nOuterHeight + margin;

		iframe.attr('width', '100%')
			.attr('height', wHeight)
			.css('margin-top', -margin);

		$syncWrapper.empty().append(iframe);
		$('a[href="#sync"]').tab('show');
	};

	_.loadURL = function (url) {
		//window.location.href = _.parseURL(url);
		// TODO: dosen't work on mobile devices
		window.open(_.parseURL(url), '_blank');
	};


	_.parseURL = function (url) {
		return $gotoAddon.text() + url;
	}

});