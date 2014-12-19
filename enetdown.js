/*!
 * ENETDOWN.js (https://github.com/elad/enetdown)
 * Copyright (c) 2014 Elad Efrat
 * Licensed under MIT (https://github.com/elad/enetdown/blob/master/LICENSE)
 */

(function() {
	// Run callback every interval milliseconds and only proceed if we didn't get a stop signal.
	function set_interval(callback, interval) {
		var loop = function() {
			callback(function(stop) {
				if (!stop) {
					setTimeout(loop, typeof(interval) == 'function' ? interval() : interval);
				}
			});
		}
		loop();
	}

	function get_timestamp() {
		return new Date().getTime();
	}

	function enetdown(options) {
		// Try to load some resource as a test of whether we're online or not.
		this.ajax = function(options) {
			var xhr = new XMLHttpRequest,
			    timestamp = get_timestamp(),
			    that = this;

			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4 && timestamp >= that.last_event_timestamp) {
					var status = (xhr.status == 200 || xhr.status == 204) ? 'online' : 'offline';
					options.callback(status);
				}
			}

			xhr.open('GET', options.url, true);
			xhr.timeout = options.timeout;
			xhr.send();
		}
		this.fake_ajax = function(options) {
			var image = new Image,
			    waiting = true,
			    timestamp = get_timestamp(),
			    that = this,
			    callback = function(e) {
			    	waiting = false;
			    	options.callback('online');
			    };

			image.onload = image.onerror = callback;

			// Images get cached, so avoid that.
			image.src = options.url + '?cache_bust=' + timestamp;

			setTimeout(function() {
				if (waiting && timestamp >= that.last_event_timestamp) {
					options.callback('offline');
				}
			}, options.timeout);
		}

		this.options = {
			// Listen and act according to browser online/offline events.
			listen_to_browser_events: true,

			// Ping this URL every delay seconds to see if we're online.
			ping_resource_url: null,
			ping_resource_delay: 30000,
			ping_resource_delay_while_offline: 5000,

			// Call this function whenever online status changes.
			status_change_callback: null,

			// Set the state to "online" by default.
			initial_online: true,

			// Set to true to bypass CORS using an Image element instead of XHR.
			bypass_cors: false
		}

		// Online indicator.
		this.is_online = undefined;

		// Request timeout.
		this.request_timeout = 500;

		// Keep a timestamp of the last change event to prevent race conditions where
		// the time of our access to the remote resource is older than the time some
		// other component notified us we're online.
		this.last_event_timestamp = 0;

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
					var f = that.options.bypass_cors ? that.fake_ajax : that.ajax;
					f.call(that, {
						url: that.options.ping_resource_url,
						timeout: that.request_timeout,
						error_means_online: that.options.error_means_online,
						callback: function(status) {
							if (status == 'online') {
								online_cb();
							} else if (status == 'offline') {
								offline_cb();
							}

							callback();
						}
					});
				}, function() {
					return that.online() ? that.options.ping_resource_delay : that.options.ping_resource_delay_while_offline;
				});
			}
		}

		// Delay between reconnect and callback execution.
		// NOTE: This is done because at least Chrome gives net::ERR_NETWORK_CHANGED when trying to use the connection immediately after "pulling the plug" and reconnecting.
		this._callback_execution_delay = 100;

		// Online status getter/setter.
		this.online = function(online) {
			// Boolean value for 'online' means we're setting the value.
			if (online === true || online === false) {
				this.last_event_timestamp = get_timestamp();

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
