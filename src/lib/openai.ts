/**
 * OpenAI API Client Wrapper
 * Used for vibe-to-category mapping and intelligent itinerary suggestions.
 */

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';

export const openai = {
  async mapVibeToCategories(query: string) {
    console.log(`Mapping vibe: ${query}`);
    
    // In a real app, this would call OpenAI Chat Completion
    // For the hackathon starter, we provide a smart fallback logic
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('chill') || lowerQuery.includes('relax')) {
      return ['Cafes', 'Parks', 'Bookstores', 'Libraries'];
    }
    if (lowerQuery.includes('date') || lowerQuery.includes('romantic')) {
      return ['Restaurants', 'Wine Bars', 'Viewpoints', 'Gardens'];
    }
    if (lowerQuery.includes('family') || lowerQuery.includes('kids')) {
      return ['Playgrounds', 'Family Restaurants', 'Museums', 'Ice Cream'];
    }
    
    return ['Popular Spots', 'Hidden Gems'];
  },

  async generateItineraryNarrative(pois: string[]) {
    return `Enjoy a curated walk through ${pois.join(', ')}. Start with a fresh coffee, browse local books, and end with a delicious brunch.`;
  },

  async suggestLocalEvents(location: string) {
    // Simulating event discovery logic
    const events = [
      { id: 'ev1', name: 'Midnight Hawker Festival', date: 'Tonight, 10PM', type: 'Food', vibe: 'Vibrant' },
      { id: 'ev2', name: 'Art After Dark: Gillman Barracks', date: 'Fri, 7PM', type: 'Culture', vibe: 'Creative' },
      { id: 'ev3', name: 'ZoukOut Beach Cleanup', date: 'Sat, 8AM', type: 'Community', vibe: 'Impactful' }
    ];
    return events;
  }
};
