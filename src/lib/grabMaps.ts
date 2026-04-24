export interface POI {
  poi_id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  formatted_address: string;
  rating?: number;
}

export const grabMaps = {
  async search(keyword: string): Promise<any> {
    const response = await fetch(`/api/grab/search?keyword=${encodeURIComponent(keyword)}`);
    if (!response.ok) {
      const err = await response.json();
      return { error: 'Search Failed', details: err.details };
    }
    return response.json();
  },

  async getNearbyPOIs(lat: number, lng: number): Promise<any> {
    const response = await fetch(`/api/grab/nearby?lat=${lat}&lng=${lng}`);
    if (!response.ok) {
      const err = await response.json();
      return { error: 'Nearby Failed', details: err.details };
    }
    return response.json();
  },

  async oneMapSearch(query: string): Promise<any> {
    const response = await fetch(`/api/onemap/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) return { error: 'OneMap Failed' };
    return response.json();
  }
};
