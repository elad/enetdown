/*!
 * ENETDOWN.js (https://github.com/eladxxx/enetdown)
 * Copyright (c) 2014 Elad Efrat
 * Licensed under MIT (https://github.com/eladxxx/enetdown/blob/master/LICENSE)
 */

(function() {
	// Run callback every interval milliseconds and only proceed if we didn't get a stop signal.
	function set_interval(callback, interval) {
		var loop = function() {
			callback(function(stop) {
				if (!stop) {
					setTimeout(loop, interval);
				}
			});
		}
		loop();
	}

	// Try to load some resource as a test of whether we're online or not.
	function fake_ajax(options) {
		var image = new Image,
		    waiting = true,
		    callback = function(e) {
		    	waiting = false;
		    	options.success();
		    };

		image.onload = image.onerror = callback;

		image.src = options.url + (options.cache_bust ? ('?cache_bust=' + new Date().getTime()) : '');

		setTimeout(function() {
			if (waiting) {
				options.error();
			}
		}, options.timeout);
	}

	function enetdown(options) {
		this.options = {
			// Listen and act according to browser online/offline events.
			listen_to_browser_events: true,

			// Ping this URL every delay seconds to see if we're online.
			ping_resource_url: null,
			ping_resource_delay: 5000,

			// Call this function whenever online status changes.
			status_change_callback: null,

			// If set to true, a "random" string will be appended to requests.
			cache_bust: true,

			// Set the state to "online" by default.
			initial_online: true
		}

		// Online indicator.
		this.is_online = undefined;

		this.initialize = function(options) {
			if (options) {
				for (var k in options) {
					this.options[k] = options[k];
				}
			}

			this.is_online = this.options.initial_online;

			var that = this,
			    online_cb = function() { that.online(true); },
			    offline_cb = function() { that.online(false); };

			if (this.options.listen_to_browser_events) {
				window.ononline = online_cb;
				window.onoffline = offline_cb;
			}

			if (this.options.ping_resource_url) {
				set_interval(function(callback) {
					fake_ajax({
						url: that.options.ping_resource_url,
						timeout: that.options.ping_resource_delay,
						cache_bust: that.options.cache_bust,
						success: function() {
							online_cb();
							callback();
						},
						error: function() {
							offline_cb();
							callback();
						}
					});
				}, this.options.ping_resource_delay);
			}
		}

		// Delay between reconnect and callback execution.
		// NOTE: This is done because at least Chrome gives net::ERR_NETWORK_CHANGED when trying to use the connection immediately after "pulling the plug" and reconnecting.
		this._callback_execution_delay = 100;

		// Online status getter/setter.
		this.online = function(online) {
			// Boolean value for 'online' means we're setting the value.
			if (online === true || online === false) {
				var changed = (this.is_online !== online);

				this.is_online = online;

				if (changed && this.options.status_change_callback) {
					var that = this;
					setTimeout(function() {
						that.options.status_change_callback(that.is_online);
					}, this._callback_execution_delay);
				}

				return this;
			}

			return this.is_online;
		}

		this.initialize(options);

		return this;
	}

	var _enetdown = function(options) {
		return new enetdown(options);
	}

	// CommonJS, AMD, and global support.
	if (typeof(module) !== 'undefined' && module.exports) {
		module.exports = _enetdown;
	} else if (typeof(define) === 'function' && define.amd) {
		define('enetdown', function() {
			return _enetdown;
		});
	} else {
		this.enetdown = _enetdown;
	}
}).call(this);