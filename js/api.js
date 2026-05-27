/**
 * Mock API Layer for KAISU Fleet Dashboard
 * Replace with real API endpoints for production
 */

const API = {
  baseURL: 'https://api.example.com',
  mockEnabled: true,

  generateMockFleet() {
    const trucks = [
      { id: 'AAA178YM', status: 'idle', parking: 90.3, label: '[xu Zijian]', note: 'Long parking duration' },
      { id: 'SMK382YL', status: 'active', parking: null, label: null, note: 'Shown on map page' },
      { id: 'SMK961YL', status: 'active', parking: null, label: null, note: 'Shown on map page' },
      { id: 'MUS832YL', status: 'active', parking: null, label: null, note: 'Known from vehicle list' },
      { id: 'MUS835YL', status: 'active', parking: null, label: null, note: 'Known from vehicle list' },
      { id: 'SMK963YL', status: 'active', parking: null, label: null, note: 'Known from vehicle list' },
      { id: 'MUS837YL', status: 'active', parking: null, label: null, note: 'Known from vehicle list' },
      { id: 'SMK962YL', status: 'idle', parking: 1.3, label: '[xu Zijian]', note: 'Short parking duration' },
      { id: 'SMK959YL', status: 'active', parking: null, label: null, note: 'Shown on map page' },
      { id: 'SMK381YL', status: 'active', parking: null, label: null, note: 'Known from vehicle list' },
      { id: 'SMK955YL', status: 'active', parking: null, label: null, note: 'Known from vehicle list' },
      { id: 'GGE232YL', status: 'lost', parking: 142, label: '[xu Zijian]', note: 'Highest alert duration' },
      { id: 'MUS833YL', status: 'active', parking: null, label: null, note: 'Known from vehicle list' },
      { id: 'MUS839YL', status: 'idle', parking: 1.5, label: '[xu Zijian]', note: 'Short parking duration' },
      { id: 'MUS836YL', status: 'active', parking: null, label: null, note: 'Known from vehicle list' },
      { id: 'SMK935YL', status: 'active', parking: null, label: null, note: 'Known from vehicle list' },
      { id: 'SMK953YL', status: 'active', parking: null, label: null, note: 'Shown on map page' },
      { id: 'GGE231YL', status: 'active', parking: null, label: null, note: 'Known from vehicle list' },
      { id: 'GGE227YL', status: 'idle', parking: 0.6, label: '[xu Zijian]', note: 'Shortest idle alert' },
      { id: 'GGE233YL', status: 'active', parking: null, label: null, note: 'Known from vehicle list' },
      { id: 'GGE225YL', status: 'active', parking: null, label: null, note: 'Known from vehicle list' },
      { id: 'MUS830YL', status: 'idle', parking: 1.8, label: '[xu Zijian]', note: 'Short parking duration' },
      { id: 'EKY304YL', status: 'idle', parking: 18.4, label: '[xu Zijian]', note: 'Moderate parking duration' },
      { id: 'AAA180YM', status: 'active', parking: null, label: null, note: 'Known from vehicle list' },
      { id: 'KJA788YM', status: 'active', parking: null, label: null, note: 'Known from vehicle list' },
      { id: 'KJA810YM', status: 'idle', parking: 3.8, label: '[xu Zijian]', note: 'Moderate parking duration' },
      { id: 'KJA802YM', status: 'idle', parking: 84.3, label: '[xu Zijian]', note: 'High-priority idle alert' },
      { id: 'KJA827YM', status: 'idle', parking: 5.4, label: '[xu Zijian]', note: 'Moderate parking duration' },
      { id: 'KJA832YM', status: 'active', parking: null, label: null, note: 'Known from vehicle list' },
      { id: 'KJA820YM', status: 'active', parking: null, label: null, note: 'Shown on map page' }
    ];
    return trucks;
  },

  async getFleet() {
    try {
      if (this.mockEnabled) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return {
          success: true,
          data: this.generateMockFleet(),
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Fleet API Error:', error);
      return { success: false, error: error.message };
    }
  },

  async getStats() {
    try {
      const fleetResponse = await this.getFleet();
      if (!fleetResponse.success) return { success: false };

      const fleet = fleetResponse.data;
      const total = fleet.length;
      const active = fleet.filter(t => t.status === 'active').length;
      const idle = fleet.filter(t => t.status === 'idle').length;
      const lost = fleet.filter(t => t.status === 'lost').length;
      const flagged = idle + lost;
      const maxParking = Math.max(...fleet.filter(t => t.parking).map(t => t.parking));
      const maxTruck = fleet.find(t => t.parking === maxParking);

      return {
        success: true,
        data: {
          total,
          active,
          idle,
          lost,
          flagged,
          maxParking: maxParking.toFixed(1),
          maxTruck: maxTruck?.id,
          percentUnflagged: ((active / total) * 100).toFixed(1)
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Stats API Error:', error);
      return { success: false, error: error.message };
    }
  },

  async getAlerts() {
    try {
      const fleetResponse = await this.getFleet();
      if (!fleetResponse.success) return { success: false };

      const fleet = fleetResponse.data;
      const alerts = fleet
        .filter(t => t.status === 'lost' || t.status === 'idle')
        .sort((a, b) => (b.parking || 0) - (a.parking || 0))
        .slice(0, 5)
        .map(t => ({
          id: t.id,
          status: t.status,
          parking: t.parking,
          label: t.label,
          message: t.status === 'lost' 
            ? `Assigned to ${t.label} · Parking duration: ${t.parking}h. This is a lost vehicle.`
            : `Assigned to ${t.label} · Parking duration: ${t.parking}h. Long idle period.`
        }));

      return {
        success: true,
        data: alerts,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Alerts API Error:', error);
      return { success: false, error: error.message };
    }
  },

  async getMapMarkers() {
    try {
      const alerts = await this.getAlerts();
      if (!alerts.success) return { success: false };

      const positions = [
        { id: 'GGE232YL', left: 72, top: 30, status: 'danger' },
        { id: 'AAA178YM', left: 22, top: 56, status: 'warn' },
        { id: 'KJA802YM', left: 60, top: 68, status: 'warn' },
        { id: 'SMK382YL', left: 40, top: 28, status: 'normal' },
        { id: 'KJA820YM', left: 47, top: 41, status: 'normal' }
      ];

      return {
        success: true,
        data: positions,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Map API Error:', error);
      return { success: false, error: error.message };
    }
  }
};
