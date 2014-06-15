# ENETDOWN

Online/offline state change detection.

# Install

First, put `enetdown.js` somewhere, or install it from Bower:

```
	bower install enetdown
```

Then, include it in your project either directly:

```
	<script type="text/javascript" src="enetdown.js"></script>
```

or as a module, for example:

```
	define(['enetdown'], function(enetdown) {
		// stuff
	});
```

# Usage

Initialize with a callback to use for state changes:

```
	enetdown({
		status_change_callback: function(online) {
			// online is a boolean
		}
	});
```

# Options

Available options:

* `status_change_callback`: function, default: `null`. Function to call when a state change is detected. The function will receive a boolean as its only parameter, indicating if the browser is online (`true`) or offline (`false`).

* `ping_resource_url`: string (URL), default: `null`. If set to some URL, it will serve as a resource that will be fetched periodically to determine if the browser is online or offline. This could be a small file, an API endpoint that sends back an empty response (204), and so on.

* `ping_resource_delay`: number (milliseconds), default: 30000 (30 seconds). Delay between fetches of the above resource while online.

* `ping_resource_delay_while_offline`: number (milliseconds), default: 5000 (5 seconds). Delay between fetches of the above resource while offline.

* `bypass_cors`: boolean, default: `false`. You should always use a URL you control and will accept your requests. However, when you use this plugin for testing, you may choose to bypass CORS and use any URL. Setting this to `true` will force the use of a dummy `Image` element instead of an `XMLHttpRequest`.

* `listen_to_browser_events`: boolean, default `true`. Some browsers (like Chrome) have built-in online/offline events. Other browsers (like Firefox) use these events for something completely different. Set to `false` to ignore.

* `initial_online`: boolean, default: `true`. The default value for the online status. If this is set to `false`, the status will be `undefined` until the first check completes.

# Methods

The `enetdown` function returns an instance that can be used to get and set the online status at any time.

Available methods:

* `online`: Get/set the online status. If a boolean is passed as its first parameter, sets the status to it. Otherwise, returns the status as a boolean. When a status change is detected, the `status_change_callback` is called. This could help you centralize online/offline handling in your app.

```
	var x = enetdown(...);
	
	// Get online status (boolean)
	var is_online = x.online();
	
	// Set online status
	x.online(false);
	
```

# Example

Open the `enetdown.html` file in your browser. Pull the plug of your network connection or turn off WiFi, reconnect, and see what happens.

# License

Licensed under MIT. See LICENSE file.
