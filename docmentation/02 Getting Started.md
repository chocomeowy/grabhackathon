# GrabMaps Playground - Beautiful Mapping Solutions

![key](/assets/images/key-icon.svg)**API key:** Try it sandboxes and embedded live demos call the proxy with your key. [Create your API key](/developer/admin) in the Dashboard if you do not have one.

Setup flow

# Getting Started

Ship the same prototype-to-production flow that powers /my-maps—Search & Discover Places, Route & Navigate, and Embed & Style Maps. Grab an API key, choose your integration style, and paste the builder snippet.

[![launch](/assets/images/launch-icon.svg)Embed & Style Maps](/developer/documentation/ui-library-config)[![launch](/assets/images/launch-icon.svg)Search & Discover Places](/developer/documentation/searching)[![launch](/assets/images/launch-icon.svg)Route & Navigate](/developer/documentation/routes)[![launch](/assets/images/launch-icon.svg)MCP integration](/developer/documentation/mcp)

Launch checklist

## Three moves before you press deploy

### Generate a scoped API key

Head to the Admin dashboard, create a key per environment, and copy it into your secrets manager.

[Open dashboard](/developer/admin)

### Pick an integration mode

Use the GrabMaps Library for a plug-and-play builder, or MapLibre GL JS if you want to wire every source yourself.

[Compare modes](/developer/documentation/initializing-map)

### Recreate your /my-maps scene

Enable navigation, labels, buildings, attribution, and coverage exactly like the demo toggles.

[View builder checklist](/developer/documentation/initializing-map)

![key](/assets/images/key-icon.svg)Keep API keys in server-side code or environment stores only. Rotate keys that hit client bundles.

Hosted bundle

## Include the library from the CDN

When you are not using npm, add the hosted GrabMaps ES module before your app code (also shown on the [Introduction](/developer/documentation#include-grabmaps) page):

```html
<script type="module" src="https://maps.grab.com/developer/assets/js/grabmaps.es.js"></script>
```

Use `type="module"` for this `.es.js` build, then use `GrabMapsBuilder` as in the library snippet below.

Choose your mode

## GrabMaps Library vs MapLibre GL JS

Both modes share attribution, tiles, and coverage—pick the surface that matches your control needs.

![star](/assets/images/star-icon.svg)Recommended

### GrabMaps Library

Mirrors the /my-maps builder with explicit \`enableNavigation\`, \`enableLabels\`, and \`enableCoverage\` helpers.

```javascript
const grabMaps = new window.GrabMaps.GrabMapsBuilder()
  .setBaseUrl('https://maps.grab.com')
  .setApiKey(import.meta.env.VITE_BRAGMAPS_KEY)
  .build();

const map = new window.GrabMaps.MapBuilder(grabMaps)
  .setContainer('map')
  .setCenter([103.8198, 1.3521])
  .setZoom(12)
  .enableNavigation()
  .enableBuildings()
  .enableAttribution()
  .build();
```

![code](/assets/images/duxton-code-icon.svg)Low-level

### MapLibre GL JS

Keep total control of sources, layers, and styling while still relying on GrabMaps tiles and data.

```typescript
import maplibregl from 'maplibre-gl';

// Fetch map style with Bearer token authentication
fetch('https://maps.grab.com/api/style.json?theme=basic', {
  headers: {
    'Authorization': 'Bearer bm_your_api_key_here'
  }
})
.then(response => response.json())
.then(style => {
const map = new maplibregl.Map({
  container: 'map',
    style: style,
  center: [103.8198, 1.3521],
  zoom: 12,
});

  map.addControl(new maplibregl.NavigationControl(), 'top-right');
});
```

Validate quickly

## Run the live demo scenes

Every doc page links to the exact HTML demos we host publicly so you can confirm behaviour before wiring your backend.

Try [/basic-initialization.html](/api/demos/map-examples/html/basic-initialization.html) to confirm your API key, tiles, and attribution look correct. Then swap the demo path for any other feature.

Where to next

## Jump into the chapter you need

### Initializing a map

Bring the builder pattern into your own React or vanilla JS app—the same base scene as /my-maps.

[See guide ![launch](/assets/images/launch-icon.svg)](/developer/documentation/initializing-map) 

### Search & Discover Places

Search and discover places with real-world context—keyword search, nearby, and reverse-geo.

[See guide ![launch](/assets/images/launch-icon.svg)](/developer/documentation/searching) 

### Route & Navigate

Get users where they need to go—faster and smarter with congestion-aware directions.

[See guide ![launch](/assets/images/launch-icon.svg)](/developer/documentation/routes) 

### Embed & Style Maps

High-quality vector tiles with real-time updates and full control over styling via GrabMapsLib.

[See guide ![launch](/assets/images/launch-icon.svg)](/developer/documentation/ui-library-config) 

### Automate with MCP

Expose search, directions, and nearby POIs to AI assistants via Model Context Protocol.

[See guide ![launch](/assets/images/launch-icon.svg)](/developer/documentation/mcp) 

API Reference

## Core endpoints

Essential API calls for map setup.

POST`GrabMapsBuilder().build()`

GrabMaps Library builder pattern.

```javascript
const grabMaps = new window.GrabMaps.GrabMapsBuilder()
  .setBaseUrl('https://maps.grab.com')
  .setApiKey(import.meta.env.VITE_BRAGMAPS_KEY)
  .build();

const map = new window.GrabMaps.MapBuilder(grabMaps)
  .setContainer('map')
  .setCenter([103.8198, 1.3521])
  .setZoom(12)
  .enableNavigation()
  .enableBuildings()
  .enableAttribution()
  .build();
```