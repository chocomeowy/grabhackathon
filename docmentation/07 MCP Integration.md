# GrabMaps Playground - Beautiful Mapping Solutions

![key](/assets/images/key-icon.svg)**API key:** Try it sandboxes and embedded live demos call the proxy with your key. [Create your API key](/developer/admin) in the Dashboard if you do not have one.

## ![robot](/assets/images/ai-icon.svg)MCP Integration

Model Context Protocol integration for AI assistants and LLM applications.

### ![info-circle](/assets/images/moreinfo-icon.svg)Overview

The MCP (Model Context Protocol) integration allows AI assistants like Claude to:

-   Search for places and addresses
-   Calculate routes and directions
-   Find nearby points of interest

![lightbulb](/assets/images/ai-icon.svg)**Use Case:** Enable your AI assistant to provide location-based services and mapping functionality through natural language.

### ![setting](/assets/images/settings-icon.svg)Setup

###### ![file-code](/assets/images/code-icon.svg)Configuration

Add to your Claude Desktop or Cursor MCP configuration (merge into the existing `mcpServers` object if you already have other servers). The server key `grab-maps-playground` matches the JSON copied from **Developer Admin → MCP URLs** after you create an MCP URL; use your token from that panel in place of `YOUR_API_KEY`.

```json
{
  "mcpServers": {
    "grab-maps-playground": {
      "url": "https://maps.grab.com/api/v1/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

### ![enhance](/assets/images/enhance-icon.svg)Available Tools

![search](/assets/images/search-icon.svg)

###### search\_places

Search for places by name or category

`query, lat, lon, radius`

![missing-road](/assets/images/missing-road-icon.svg)

###### get\_directions

Calculate routes between locations

`origin, destination, waypoints`

![location](/assets/images/location-icon.svg)

###### nearby\_search

Find nearby points of interest

`lat, lon, radius, category`

### ![chat](/assets/images/chat-icon.svg)Example Usage with Claude

###### Natural Language Queries:

**You:**

"Find restaurants near Marina Bay Sands in Singapore"

**Claude:**

Uses the `search_places` tool to find restaurants...

**You:**

"What's the fastest route from Orchard Road to Changi Airport?"

**Claude:**

Uses the `get_directions` tool to calculate the route...

### ![book](/assets/images/menu-book-icon.svg)Resources

[

###### ![launch](/assets/images/launch-icon.svg)Model Context Protocol Documentation

Learn more about the MCP standard

](https://modelcontextprotocol.io)[

###### ![github](/assets/images/github-logo.svg)GrabMaps Playground on GitHub

Source code and examples

](https://github.com/grab/maps-playground)

API Reference

## MCP tools

Tools available to AI assistants via the MCP server.

POST`search_places`

Search for places by name or category.

```json
{ "query": "restaurants Marina Bay", "lat": 1.3521, "lon": 103.8198, "radius": 1000 }
```

POST`get_directions`

Calculate routes between locations.

```json
{ "origin": "Orchard Road", "destination": "Changi Airport", "waypoints": [] }
```

POST`nearby_search`

Find nearby points of interest.

```json
{ "lat": 1.3521, "lon": 103.8198, "radius": 500, "category": "restaurant" }
```