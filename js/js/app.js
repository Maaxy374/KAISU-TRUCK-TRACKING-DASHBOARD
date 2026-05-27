/**
 * KAISU Fleet Dashboard Application
 * Main application logic and UI rendering
 */

const App = {
  state: {
    fleet: [],
    stats: {},
    alerts: [],
    markers: [],
    activeFilter: 'all',
    searchTerm: ''
  },

  async init() {
    console.log('🚀 Initializing KAISU Dashboard...');
    this.setupEventListeners();
    this.setupIntersectionObserver();
    await this.loadData();
  },

  async loadData() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) refreshBtn.classList.add('loading');

    try {
      const [fleetRes, statsRes, alertsRes, markersRes] = await Promise.all([
        API.getFleet(),
        API.getStats(),
        API.getAlerts(),
        API.getMapMarkers()
      ]);

      if (fleetRes.success) {
        this.state.fleet = fleetRes.data;
        this.renderFleetTable();
      }

      if (statsRes.success) {
        this.state.stats = statsRes.data;
        this.renderStats();
      }

      if (alertsRes.success) {
        this.state.alerts = alertsRes.data;
        this.renderAlerts();
      }

      if (markersRes.success) {
        this.state.markers = markersRes.data;
        this.renderMapMarkers();
      }

      const now = new Date().toLocaleTimeString();
      const footerTime = document.getElementById('footerTime');
      if (footerTime) footerTime.textContent = now;

      console.log('✅ Dashboard data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
    } finally {
      if (refreshBtn) refreshBtn.classList.remove('loading');
    }
  },

  renderStats() {
    const { total, active, idle, lost, flagged, maxParking, maxTruck, percentUnflagged } = this.state.stats;

    document.getElementById('totalTrucks').textContent = total;
    document.getElementById('lostCount').textContent = lost;
    document.getElementById('idleCount').textContent = idle;

    document.getElementById('stat1').textContent = total;
    document.getElementById('stat2').textContent = flagged;
    document.getElementById('stat2-sub').innerHTML = `(${lost} lost + ${idle} idle)`;
    document.getElementById('stat3').textContent = `${maxParking}h`;
    document.getElementById('stat3-sub').textContent = maxTruck || 'N/A';
    document.getElementById('stat4').textContent = `${percentUnflagged}%`;

    document.getElementById('metricTotal').textContent = total;
    document.getElementById('metricActive').textContent = active;
    document.getElementById('metricIdle').textContent = `${idle} idle`;
    document.getElementById('metricLost').textContent = `${lost} lost`;
    document.getElementById('metricTime').textContent = new Date().toLocaleTimeString();

    document.getElementById('ratioFlagged').textContent = `${flagged} / ${total}`;
    document.getElementById('barFlagged').style.width = `${(flagged / total) * 100}%`;

    document.getElementById('ratioIdle').textContent = `${idle} / ${total}`;
    document.getElementById('barIdle').style.width = `${(idle / total) * 100}%`;

    document.getElementById('ratioHealthy').textContent = `${active} / ${total}`;
    document.getElementById('barHealthy').style.width = `${(active / total) * 100}%`;
  },

  renderAlerts() {
    const alertsList = document.getElementById('alertsList');
    if (!alertsList) return;

    if (this.state.alerts.length === 0) {
      alertsList.innerHTML = '<div class="loading"><p>No alerts at this time</p></div>';
      return;
    }

    alertsList.innerHTML = this.state.alerts
      .map(alert => `
        <div class="alert ${alert.status === 'lost' ? 'danger' : 'warn'}">
          <div class="alert-top">
            <div class="alert-title">${alert.id}</div>
            <span class="badge ${alert.status === 'lost' ? 'danger' : 'warn'}">
              ${alert.status === 'lost' ? 'Lost Vehicle' : 'Lazy Driver'}
            </span>
          </div>
          <p>${alert.message}</p>
        </div>
      `)
      .join('');
  },

  renderFleetTable() {
    const fleetBody = document.getElementById('fleetBody');
    if (!fleetBody) return;

    if (this.state.fleet.length === 0) {
      fleetBody.innerHTML = '<tr><td colspan="5" class="loading"><p>No data available</p></td></tr>';
      return;
    }

    fleetBody.innerHTML = this.state.fleet
      .map(truck => `
        <tr data-status="${truck.status}" data-truck="${truck.id}">
          <td data-label="Truck Number">${truck.id}</td>
          <td data-label="Status">
            <span class="status ${truck.status === 'idle' ? 'idle' : truck.status === 'lost' ? 'lost' : ''}">
              ${truck.status === 'active' ? 'Visible' : truck.status === 'idle' ? 'Lazy Driver' : 'Lost Vehicle'}
            </span>
          </td>
          <td data-label="Parking">${truck.parking ? truck.parking + 'h' : '—'}</td>
          <td data-label="Assigned Label">${truck.label || '—'}</td>
          <td data-label="Visibility Note">${truck.note}</td>
        </tr>
      `)
      .join('');
  },

  renderMapMarkers() {
    const mapMarkers = document.getElementById('mapMarkers');
    if (!mapMarkers) return;

    mapMarkers.innerHTML = this.state.markers
      .map(marker => `
        <div class="marker ${marker.status}" style="left:${marker.left}%; top:${marker.top}%;"></div>
        <div class="label" style="left:${marker.left}%; top:${marker.top}%;">${marker.id}</div>
      `)
      .join('');
  },

  setupEventListeners() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadData());
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.state.searchTerm = e.target.value.toLowerCase();
        this.filterFleetTable();
      });
    }

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.activeFilter = btn.dataset.filter;
        this.filterFleetTable();
      });
    });
  },

  filterFleetTable() {
    const rows = document.querySelectorAll('#fleetBody tr');
    rows.forEach(row => {
      const status = row.dataset.status;
      const truck = row.dataset.truck.toLowerCase();

      const matchesStatus = this.state.activeFilter === 'all' || status === this.state.activeFilter;
      const matchesSearch = truck.includes(this.state.searchTerm);

      row.style.display = matchesStatus && matchesSearch ? '' : 'none';
    });
  },

  setupIntersectionObserver() {
    const revealEls = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach(el => {
      if (!el.classList.contains('visible')) io.observe(el);
    });

    const fills = document.querySelectorAll('.bar-fill');
    const barObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const fill = entry.target;
          fill.style.width = fill.dataset.width;
          barObserver.unobserve(fill);
        }
      });
    }, { threshold: 0.4 });

    fills.forEach(fill => barObserver.observe(fill));
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
