/* =====================================================
   HomeFinder Portal — Shared JS Utilities & Mock Data
   ===================================================== */

// ===================== MOCK DATA =====================

const MOCK_PROPERTIES = [
  {
    id: 1, title: 'Modern Family Home', type: 'house', status: 'For Sale',
    price: 485000, address: '14 Maple Grove, London, SW12 4RJ',
    beds: 4, baths: 2, sqft: 1850, parking: true,
    img: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80',
    imgs: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    ],
    desc: 'A beautifully presented four-bedroom family home set on a quiet residential street. Features an open-plan kitchen/diner, landscaped garden, and recently renovated bathrooms. Close to excellent schools and transport links.',
    features: ['Open-plan kitchen', 'Landscaped garden', 'Double garage', 'Central heating', 'Recently renovated'],
    lat: 51.45, lng: -0.14, featured: true
  },
  {
    id: 2, title: 'City Centre Apartment', type: 'apartment', status: 'For Rent',
    price: 1850, address: 'Apt 7B, The Riverside, Manchester, M3 1LW',
    beds: 2, baths: 1, sqft: 820, parking: false,
    img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80',
    imgs: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
    ],
    desc: 'Stunning riverside apartment with floor-to-ceiling windows and panoramic city views. Fully furnished with premium finishes. 24-hour concierge, gym, and rooftop terrace included. Available from 1st June.',
    features: ['River views', 'Fully furnished', '24hr concierge', 'Rooftop terrace', 'Gym access'],
    lat: 53.48, lng: -2.24, featured: true
  },
  {
    id: 3, title: 'Victorian Terraced House', type: 'house', status: 'For Sale',
    price: 320000, address: '82 Rosewood Lane, Birmingham, B15 2TH',
    beds: 3, baths: 1, sqft: 1200, parking: false,
    img: 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=600&q=80',
    imgs: [
      'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    ],
    desc: 'Charming period property retaining original features including fireplaces and coving. Recently updated kitchen and bathroom. Private rear garden. Moments from the city centre and excellent transport links.',
    features: ['Period features', 'Private garden', 'Updated kitchen', 'Gas central heating', 'Near transport'],
    lat: 52.48, lng: -1.9, featured: false
  },
  {
    id: 4, title: 'Luxury Penthouse', type: 'apartment', status: 'For Sale',
    price: 1200000, address: 'Penthouse, One Canary Wharf, London, E14 5AB',
    beds: 3, baths: 3, sqft: 2100, parking: true,
    img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
    imgs: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
    ],
    desc: 'An exceptional penthouse apartment offering breathtaking Thames views from every room. Bespoke designer kitchen, private terrace, and two underground parking spaces. Residents enjoy a pool, spa, and 24-hour security.',
    features: ['Thames views', 'Private terrace', 'Designer kitchen', 'Pool & Spa', '2 parking spaces'],
    lat: 51.50, lng: -0.02, featured: true
  },
  {
    id: 5, title: 'Prime Office Space', type: 'commercial', status: 'For Rent',
    price: 4500, address: '3rd Floor, Exchange Tower, Leeds, LS1 1BA',
    beds: 0, baths: 2, sqft: 3200, parking: true,
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80',
    imgs: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80',
    ],
    desc: 'Modern open-plan office suite in a prestigious city centre tower. Features raised flooring, climate control, and high-speed fibre. 10 designated parking spaces. Ideal for 20-35 person team.',
    features: ['Open plan', 'Climate control', 'Fibre broadband', '10 parking spaces', 'City views'],
    lat: 53.80, lng: -1.55, featured: false
  },
  {
    id: 6, title: 'Development Land Plot', type: 'land', status: 'For Sale',
    price: 210000, address: 'Plot 4, Greenfield Estate, Bristol, BS10 6AA',
    beds: 0, baths: 0, sqft: 8500, parking: false,
    img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80',
    imgs: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
      'https://images.unsplash.com/photo-1566908829550-e6551b00979b?w=800&q=80',
    ],
    desc: 'Serviced development plot with outline planning permission for up to 4 detached dwellings. Level site with road frontage, mains services connected. Located within a popular new-build estate.',
    features: ['Planning permission', 'Mains services', 'Road frontage', 'Level site', '0.2 acres'],
    lat: 51.49, lng: -2.6, featured: false
  },
  {
    id: 7, title: 'Semi-Detached Family Home', type: 'house', status: 'For Sale',
    price: 390000, address: '27 Chestnut Avenue, Edinburgh, EH4 3DQ',
    beds: 4, baths: 2, sqft: 1650, parking: true,
    img: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80',
    imgs: [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    ],
    desc: 'Well-proportioned semi-detached home in a sought-after residential area. Large south-facing garden, integral garage, and modern fitted kitchen. Walking distance to Stockbridge village.',
    features: ['South-facing garden', 'Integral garage', 'Modern kitchen', 'Near schools', 'Quiet street'],
    lat: 55.95, lng: -3.2, featured: false
  },
  {
    id: 8, title: 'Studio Apartment', type: 'apartment', status: 'For Rent',
    price: 950, address: 'Studio 3, Park View, Glasgow, G1 2TT',
    beds: 0, baths: 1, sqft: 380, parking: false,
    img: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80',
    imgs: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
    ],
    desc: 'Stylish studio apartment ideal for young professionals. Open-plan living space with a fully equipped kitchen, en-suite shower room, and private balcony. Bills included in the rent.',
    features: ['Bills included', 'Private balcony', 'Furnished', 'City views', 'Near transport'],
    lat: 55.86, lng: -4.25, featured: false
  },
  {
    id: 9, title: 'Retail Unit — High Street', type: 'commercial', status: 'For Rent',
    price: 3200, address: '12 Market Street, Cardiff, CF10 1AH',
    beds: 0, baths: 1, sqft: 1800, parking: false,
    img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80',
    imgs: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    ],
    desc: 'Prime high-street retail unit on one of Cardiff\'s busiest shopping streets. Newly refurbished with full-height glazed frontage, accessible entrance, and rear storage.',
    features: ['High street location', 'Newly refurbished', 'Large frontage', 'Rear storage', 'Accessible'],
    lat: 51.48, lng: -3.18, featured: false
  },
  {
    id: 10, title: 'New Build Detached', type: 'house', status: 'For Sale',
    price: 550000, address: 'Plot 12, Oakwood Gardens, Nottingham, NG7 1BX',
    beds: 5, baths: 3, sqft: 2200, parking: true,
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
    imgs: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
    ],
    desc: 'A stunning new-build detached home offering the latest in energy-efficient design. Five bedrooms, three bathrooms, home office, and a double garage. 10-year NHBC warranty included.',
    features: ['A+ energy rating', '10yr NHBC warranty', 'Home office', 'Double garage', 'Underfloor heating'],
    lat: 52.95, lng: -1.14, featured: true
  }
];

const MOCK_INQUIRIES = [
  { id: 1, propertyId: 1, propertyTitle: 'Modern Family Home', message: 'Is the property still available? Would love to arrange a viewing.', status: 'Responded', date: '2026-05-01', reply: 'Yes, absolutely available! We can arrange a viewing this weekend. Please let us know your preferred time.' },
  { id: 2, propertyId: 4, propertyTitle: 'Luxury Penthouse', message: 'What is the service charge per annum? Are pets allowed?', status: 'Pending', date: '2026-05-06', reply: null },
  { id: 3, propertyId: 2, propertyTitle: 'City Centre Apartment', message: 'Is the apartment available from May 15th? We are a couple, no pets.', status: 'Pending', date: '2026-05-07', reply: null },
];

const MOCK_VIEWINGS = [
  { id: 1, propertyId: 1, propertyTitle: 'Modern Family Home', date: '2026-05-12', time: '14:00', message: 'Interested in a full tour including the garden.', status: 'Confirmed' },
  { id: 2, propertyId: 7, propertyTitle: 'Semi-Detached Family Home', date: '2026-05-15', time: '10:30', message: 'Would like to bring my partner and our structural surveyor.', status: 'Pending' },
];

const MOCK_FAVORITES = [1, 4, 7];

const MOCK_USERS = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'user', status: 'Active', joined: '2026-01-14' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'user', status: 'Active', joined: '2026-02-08' },
  { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'supervisor', status: 'Active', joined: '2026-01-02' },
  { id: 4, name: 'David Brown', email: 'david@example.com', role: 'admin', status: 'Active', joined: '2025-12-01' },
];

// ===================== API HELPERS =====================

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3001'
  : '';   // empty string = same origin (Render serves both frontend + API)

async function api(path, opts = {}) {
  const u = getUser();
  const isFormData = opts.body instanceof FormData;
  const headers = isFormData ? {} : { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (u?.token) headers['Authorization'] = `Bearer ${u.token}`;
  try {
    const res = await fetch(API_BASE + path, { ...opts, headers });
    if (res.status === 401) { clearUser(); window.location.replace('login.html'); return null; }
    return res;
  } catch (err) {
    console.error('[API]', path, err.message);
    return null;
  }
}

// Map API property shape → card-compatible shape
function normalizeProperty(p) {
  if (!p) return null;
  return {
    ...p,
    img: p.images?.[0]?.url || p.img || 'https://placehold.co/600x400/1A3C5E/fff?text=No+Image',
    imgs: p.images?.map(i => i.url) || (p.imgs ? p.imgs : (p.img ? [p.img] : [])),
    imageObjects: p.images || [],
    desc: p.description ?? p.desc ?? '',
    features: Array.isArray(p.features) ? p.features
              : JSON.parse(p.features || '[]'),
  };
}

// ===================== AUTH HELPERS =====================

function getUser() {
  try { return JSON.parse(localStorage.getItem('hf_user')); } catch { return null; }
}
function setUser(u) { localStorage.setItem('hf_user', JSON.stringify(u)); }
function clearUser() { localStorage.removeItem('hf_user'); }
function isLoggedIn() { return !!getUser(); }
function isAdmin() { const u = getUser(); return u && (u.role === 'admin'); }
function isSupervisor() { const u = getUser(); return u && (u.role === 'supervisor' || u.role === 'admin'); }

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.replace('login.html?redirect=' + encodeURIComponent(window.location.href));
    throw new Error('Redirecting to login'); // stop further script execution
  }
}
function requireAdmin() {
  const u = getUser();
  if (!u || u.role !== 'admin') {
    window.location.replace('index.html');
    throw new Error('Not authorised');
  }
}
function requireSupervisor() {
  const u = getUser();
  if (!u || (u.role !== 'supervisor' && u.role !== 'admin')) {
    window.location.replace('index.html');
    throw new Error('Not authorised');
  }
}

function updateNavForUser() {
  const actions = document.getElementById('navActions');
  if (!actions) return;
  const user = getUser();
  if (user) {
    const initial = user.name ? user.name[0].toUpperCase() : 'U';
    let links = `<a href="dashboard.html" class="btn btn-ghost btn-sm">My Account</a>`;
    if (user.role === 'admin') links += `<a href="admin.html" class="btn btn-ghost btn-sm">Admin</a>`;
    if (user.role === 'supervisor') links += `<a href="supervisor.html" class="btn btn-ghost btn-sm">Reports</a>`;
    // Notification bell — regular users only
    if (user.role === 'user') {
      links += `
        <div class="notif-wrap" id="notifWrap">
          <button class="notif-bell" id="notifBell" onclick="toggleNotifDropdown(event)" title="Notifications" aria-label="Notifications">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            <span class="notif-badge" id="notifBadge" style="display:none;">0</span>
          </button>
          <div class="notif-dropdown" id="notifDropdown">
            <div class="notif-header">Notifications</div>
            <div id="notifList"><div class="notif-empty">Loading…</div></div>
          </div>
        </div>`;
    }
    links += `<div class="avatar" title="${user.name}" onclick="window.location='dashboard.html'">${initial}</div>`;
    links += `<button class="btn btn-outline btn-sm" onclick="logout()">Sign Out</button>`;
    actions.innerHTML = links;
    if (user.role === 'user') loadUserNotifications();
  }
}

// ===================== NOTIFICATIONS =====================

function _getSeenIds(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
}
function _addSeenId(key, id) {
  const ids = _getSeenIds(key);
  if (!ids.includes(id)) { ids.push(id); localStorage.setItem(key, JSON.stringify(ids)); }
}

async function loadUserNotifications() {
  const notifications = [];
  try {
    const [iqRes, vwRes] = await Promise.all([
      api('/api/inquiries?limit=50'),
      api('/api/viewings?limit=50'),
    ]);
    const seenInq  = _getSeenIds('hf_seen_inq');
    const seenView = _getSeenIds('hf_seen_view');
    if (iqRes && iqRes.ok) {
      const d = await iqRes.json();
      (d.inquiries || []).forEach(iq => {
        if (iq.status === 'Responded' && !seenInq.includes(iq.id)) {
          notifications.push({ seenKey: 'hf_seen_inq', id: iq.id, icon: '💬',
            title: iq.property?.title || 'Property', msg: 'An agent replied to your inquiry' });
        }
      });
    }
    if (vwRes && vwRes.ok) {
      const d = await vwRes.json();
      const msgs = { Confirmed: 'Your viewing has been confirmed ✅', Rescheduled: 'Your viewing was rescheduled 📅', Closed: 'Your viewing request was closed' };
      (d.viewings || []).forEach(v => {
        if (['Confirmed','Rescheduled','Closed'].includes(v.status) && !seenView.includes(v.id)) {
          notifications.push({ seenKey: 'hf_seen_view', id: v.id,
            icon: v.status === 'Confirmed' ? '✅' : v.status === 'Rescheduled' ? '📅' : '❌',
            title: v.property?.title || 'Property', msg: msgs[v.status] || v.status });
        }
      });
    }
  } catch (_) {}

  const badge = document.getElementById('notifBadge');
  const list  = document.getElementById('notifList');
  if (!badge || !list) return;
  if (notifications.length > 0) {
    badge.textContent = notifications.length > 9 ? '9+' : notifications.length;
    badge.style.display = 'flex';
    list.innerHTML = notifications.map(n => `
      <div class="notif-item" onclick="markSeenAndGo('${n.seenKey}',${n.id})">
        <span class="notif-icon">${n.icon}</span>
        <div class="notif-text">
          <div class="notif-title">${n.title}</div>
          <div class="notif-msg">${n.msg}</div>
        </div>
      </div>`).join('');
  } else {
    badge.style.display = 'none';
    list.innerHTML = '<div class="notif-empty">You\'re all caught up! 🎉</div>';
  }
}

function markSeenAndGo(key, id) {
  _addSeenId(key, id);
  closeNotifDropdown();
  window.location.href = 'dashboard.html';
}

function toggleNotifDropdown(e) {
  e.stopPropagation();
  document.getElementById('notifDropdown')?.classList.toggle('open');
}
function closeNotifDropdown() {
  document.getElementById('notifDropdown')?.classList.remove('open');
}
document.addEventListener('click', e => {
  if (!e.target.closest?.('#notifWrap')) closeNotifDropdown();
});

function logout() {
  clearUser();
  window.location.replace('index.html');
}

// ===================== FAVORITES =====================

function getFavs() {
  try { return JSON.parse(localStorage.getItem('hf_favs')) || []; } catch { return []; }
}
function toggleFav(id) {
  if (!isLoggedIn()) { window.location.href = 'login.html'; return false; }
  let favs = getFavs();
  if (favs.includes(id)) { favs = favs.filter(f => f !== id); }
  else { favs.push(id); showToast('Added to favourites!', 'success'); }
  localStorage.setItem('hf_favs', JSON.stringify(favs));
  return favs.includes(id);
}
function isFav(id) { return getFavs().includes(id); }

// ===================== PROPERTY CARD HTML =====================

function formatPrice(p, status) {
  if (status === 'For Rent') return `£${p.toLocaleString()}/mo`;
  return `£${p.toLocaleString()}`;
}

function propertyCard(p) {
  const saved = isFav(p.id);
  const bedsStr = p.beds > 0 ? `<span class="property-spec"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20v-4a2 2 0 012-2h16a2 2 0 012 2v4"/><rect x="7" y="10" width="10" height="4" rx="1"/><line x1="2" y1="16" x2="22" y2="16"/></svg>${p.beds} bd</span>` : '';
  const bathStr = p.baths > 0 ? `<span class="property-spec"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6a3 3 0 016 0v6H3v-2a4 4 0 014-4z"/><rect x="2" y="12" width="20" height="4" rx="1"/></svg>${p.baths} ba</span>` : '';
  const parkStr = p.parking ? `<span class="property-spec"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h4a3 3 0 010 6H9"/></svg>Parking</span>` : '';
  return `
  <article class="property-card" onclick="location.href='property.html?id=${p.id}'">
    <div class="property-card-img">
      <img src="${p.img}" alt="${p.title}" loading="lazy" onerror="this.src='https://placehold.co/600x400/1A3C5E/fff?text=No+Image'" />
      <span class="property-card-badge">${p.status}</span>
      <button class="property-card-save ${saved ? 'saved' : ''}" data-id="${p.id}" onclick="event.stopPropagation();handleSave(this,${p.id})" title="Save property">
        <svg viewBox="0 0 24 24" fill="${saved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" style="color:${saved ? 'var(--danger)' : 'var(--text-muted)'}">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
        </svg>
      </button>
    </div>
    <div class="property-card-body">
      <span class="property-type-tag">${p.type.charAt(0).toUpperCase()+p.type.slice(1)}</span>
      <div class="property-price">${formatPrice(p.price, p.status)}</div>
      <div class="property-address">${p.address}</div>
      <div class="property-specs">
        ${bedsStr}${bathStr}
        <span class="property-spec">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
          ${p.sqft.toLocaleString()} ft²
        </span>
        ${parkStr}
      </div>
    </div>
  </article>`;
}

function attachSaveHandlers() {} // handled inline

function handleSave(btn, id) {
  const isSaved = toggleFav(id);
  const svg = btn.querySelector('svg');
  if (isSaved) {
    btn.classList.add('saved');
    svg.setAttribute('fill', 'currentColor');
    svg.style.color = 'var(--danger)';
    showToast('Saved to favourites!', 'success');
  } else {
    btn.classList.remove('saved');
    svg.setAttribute('fill', 'none');
    svg.style.color = 'var(--text-muted)';
    showToast('Removed from favourites.', '');
  }
}

// ===================== TOAST =====================

function showToast(msg, type = '') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>${msg}`;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// ===================== MODAL HELPERS =====================

function openModal(id) {
  document.getElementById(id)?.classList.add('open');
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
}
// Close on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

// ===================== TABS =====================

function initTabs(containerSelector) {
  const tabs = document.querySelectorAll(containerSelector + ' .tab-btn');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll(containerSelector + ' .tab-content').forEach(c => c.classList.remove('active'));
      document.getElementById(target)?.classList.add('active');
    });
  });
}

// ===================== MOBILE MENU =====================

function toggleMobileMenu() {
  const nav = document.querySelector('.navbar-nav');
  if (!nav) return;
  nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
  nav.style.flexDirection = 'column';
  nav.style.position = 'absolute';
  nav.style.top = '66px';
  nav.style.left = '0';
  nav.style.right = '0';
  nav.style.background = '#fff';
  nav.style.padding = '12px 20px';
  nav.style.borderBottom = '1px solid var(--border)';
  nav.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
  nav.style.zIndex = '99';
}

// ===================== URL PARAMS =====================

function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

// ===================== NAVBAR LOGO (shared) =====================
const NAVBAR_HTML = `
<nav class="navbar">
  <div class="container navbar-inner">
    <a href="index.html" class="navbar-brand">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
        <path d="M9 21V12h6v9"/>
      </svg>
      Home<span class="accent">Finder</span>
    </a>
    <nav class="navbar-nav">
      <a href="index.html">Home</a>
      <a href="search.html">Browse</a>
      <a href="search.html?type=buy">Buy</a>
      <a href="search.html?type=rent">Rent</a>
      <a href="search.html?type=commercial">Commercial</a>
    </nav>
    <div class="navbar-actions" id="navActions">
      <a href="login.html" class="btn btn-outline btn-sm">Sign In</a>
      <a href="register.html" class="btn btn-primary btn-sm">Get Started</a>
    </div>
    <button class="navbar-hamburger" onclick="toggleMobileMenu()">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    </button>
  </div>
</nav>`;

const FOOTER_HTML = `
<footer>
  <div class="container">
    <div class="footer-grid">
      <div>
        <div class="footer-brand">Home<span>Finder</span></div>
        <p class="footer-desc">Your trusted partner in finding the perfect property. Thousands of verified listings updated daily.</p>
      </div>
      <div>
        <h5>Explore</h5>
        <div class="footer-links">
          <a href="search.html?type=house">Houses for Sale</a>
          <a href="search.html?type=apartment">Apartments</a>
          <a href="search.html?type=commercial">Commercial</a>
          <a href="search.html?type=land">Land &amp; Plots</a>
        </div>
      </div>
      <div>
        <h5>Account</h5>
        <div class="footer-links">
          <a href="register.html">Register</a>
          <a href="login.html">Sign In</a>
          <a href="dashboard.html">Dashboard</a>
        </div>
      </div>
      <div>
        <h5>Company</h5>
        <div class="footer-links">
          <a href="#">About Us</a>
          <a href="#">Contact</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 HomeFinder Portal. All rights reserved.</span>
      <span>GDPR Compliant · Secure · Trusted</span>
    </div>
  </div>
</footer>`;
