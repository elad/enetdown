# ENETDOWN

Online/offline state change detection.

This code is intended to be used as 

# Install

Put `enetdown.js` somewhere.

# Usage

Include `enetdown.js` in your project either directly:

```
	<script type="text/javascript" src="enetdown.js"></script>
```

or as a module, for example:

```
	define(['enetdown'], function(enetdown) {
		// stuff
	});
```

Then initialize it with a callback to use for state changes:

```
	enetdown({
		status_change_callback: function(online) {
			// online is a boolean
		}
	});
```

# Options

Available options:

* `listen_to_browser_events`: boolean, default `true`. Some browsers (like Chrome) have built-in online/offline events. Other browsers (like Firefox) use these events for something completely different. Set to `false` to ignore.

* `ping_resource_url`: string (URL), default: `null`. If set to some URL, it will serve as a resource that will be fetched periodically to determine if the browser is online or offline. This could be a small file, an API endpoint that sends back an empty response (204), and so on.

* `ping_resource_delay`: number (milliseconds), default: 5000. Delay between fetches of the above resource.

* `status_change_callback`: function, default: `null`. Function to call when a state change is detected. The function will receive a boolean as its only parameter, indicating if the browser is online (`true`) or offline (`false`).

* `cache_bust`: boolean, default: `true`. Sets a random value on requests to avoid caching.

* `initial_online`: boolean, default: `true`. The default value for the online status. If this is set to `false`, the status will be `undefined` until the first check completes.

# Methods

The `enetdown` function returns an instance that can be used to get and set the online status at any time.

Available methods:

* `online`: Get/set the online status. If a boolean is passed as its first parameter, sets the status to it. Otherwise, returns the status as a boolean. When a status change is detected, the `status_change_callback` is called. This could help you centralize online/offline handling in your app.

```
	var x = enetdown({
		status_change_callback: function(online) {
			// online is a boolean
		}
	});
	
	// Get online status
	var is_online = x.online();
	
	// Set online status
	x.online(false);
	
```

# Example

Open the `enetdown.html` file in your browser. Pull the plug of your network connection or turn off WiFi, reconnect, and see what happens.

# License

Licensed under MIT. See LICENSE file.

# Author

Elad Efrat