# GrabMaps Playground - Beautiful Mapping Solutions

![key](/assets/images/key-icon.svg)**API key:** Try it sandboxes and embedded live demos call the proxy with your key. [Create your API key](/developer/admin) in the Dashboard if you do not have one.

Builder workspace

# Bring the maps experience into your product

Every component we use to demo GrabMaps—map surfaces, search, and routing—now lives in a single builder-first documentation flow.

MapLibre nativeGrabMaps LibrarySEA coverageAI-ready demos

Hosted bundle

## Include the GrabMaps library

Use the developer CDN when you are not using npm—plain HTML, static sites, or quick prototypes. Load the ES module bundle with `type="module"`:

```html
<script type="module" src="https://maps.grab.com/developer/assets/js/grabmaps.es.js"></script>
```

For bundled apps, install the `grab-maps` package from npm instead. You still need MapLibre (`maplibre-gl`) and its CSS when you render a map—see [Initializing a map](/developer/documentation/initializing-map).

Why GrabMaps Playground

## What is GrabMaps Playground right now?

A production toolkit for Southeast Asia that mirrors the real /my-maps builder: the same toggles, the same data, and a clear migration path from prototype to production.

![layer](/assets/images/layer-icon.svg)

### Builder-first APIs

Toggle features exactly like the /my-maps UI with explicit builder methods.

![location](/assets/images/location-icon.svg)

### SEA-native data

High-frequency updates across Singapore, Manila, Jakarta, KL, and more.

![ethernet](/assets/images/ethernet-icon.svg)

### Two integration modes

Drop-in GrabMaps Library (npm or CDN script) or wire MapLibre GL JS directly—same docs, same flows.

![flash](/assets/images/flash-icon.svg)

### Production guardrails

API keys, rate policies, attribution helpers, and observability out of the box.

Start building

## Pick the next thing you ship

Each chapter links straight into working demos and builder snippets you can paste into your stack.

### Issue credentials

Create scoped API keys per environment and hand them to your CI/CD in minutes.

[Open guide](/developer/documentation/getting-started)

### Initialize a map

Copy the same builder snippet powering /my-maps and light up your canvas.

[View recipe](/developer/documentation/initializing-map)

### Embed & Style Maps

High-quality vector tiles with real-time updates—configure GrabMapsLib for search, routing, layers, drawing tools, and more.

[View config](/developer/documentation/ui-library-config)

### Search & Discover Places

Hook keyword search, nearby discovery, and reverse-geo with the Places API builders.

[Add features](/developer/documentation/searching)

Platform pillars

## Your /my-maps rituals, documented

We encapsulated the workflows teams rely on inside /my-maps—live data, fast styling, controlled rollout—into modular sections you can mix and match.

![enhance](/assets/images/enhance-icon.svg)

### Prototype to production without rewriting

-   What you craft inside /my-maps translates 1:1 to the docs.
-   Every section ships copy/paste-ready grabs of the builder pattern.

![growth](/assets/images/growth-icon.svg)

### Operational visibility baked in

-   Attribution and live map data mirrored from the Grab network.
-   Usage dashboards + alerts for each API key by default.

![experiment](/assets/images/experiment-icon.svg)

### Composable workflows

-   Mix search and routing in one builder pipeline.
-   Drop into React, vanilla JS, or server-rendered flows without adapters.

What you’ll ship

## Choose a workflow and clone the recipe

Every link below is a live doc section with runnable demos, builder snippet, and MapLibre parity guidance.

### Launch an interactive map workspace

Use the GrabMaps builder to enable navigation, buildings, coverage layers, and attribution in a few lines.

[Dive in ![launch](/assets/images/launch-icon.svg)](/developer/documentation/initializing-map) 

### Embed & Style Maps

High-quality vector tiles with real-time updates and full control over styling via GrabMapsLib.

[Dive in ![launch](/assets/images/launch-icon.svg)](/developer/documentation/ui-library-config) 

### Search & Discover Places

Search and discover places with real-world context—keyword search, nearby discovery, and reverse-geo.

[Dive in ![launch](/assets/images/launch-icon.svg)](/developer/documentation/searching) 

### Route & Navigate

Get users where they need to go—faster and smarter with congestion-aware directions.

[Dive in ![launch](/assets/images/launch-icon.svg)](/developer/documentation/routes) 

### MCP for assistants

Let Claude and other MCP clients call search, directions, and nearby tools against your key.

[Dive in ![launch](/assets/images/launch-icon.svg)](/developer/documentation/mcp) 

Delivery ready

## Everything documented mirrors production constraints

Attribution, auth, data sources, and performance budgets are woven through every example so you can ship the same day you prototype.

Required attribution: **© Grab | © OpenStreetMap contributors**. Every builder example shows where to enable it, and the MapLibre snippets include the same control.