const API_BASE = 'http://localhost:5001/api';

const request = async (path, options = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API error');
  return data;
};

export const api = {
  getRestaurants: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/restaurants${qs ? '?' + qs : ''}`);
  },
  getRestaurant: (id) => request(`/restaurants/${id}`),
  getMenu: (id) => request(`/restaurants/${id}/menu`),
  createOrder: (body) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
  getOrder: (id) => request(`/orders/${id}`),
  payOrder: (id) => request(`/orders/${id}/pay`, { method: 'POST' }),
  getKitchenOrders: () => request('/kitchen/orders'),
  updateKitchenOrder: (id, status) => request(`/kitchen/orders/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getServices: () => request('/services'),
  getService: (id) => request(`/services/${id}`),
  createBooking: (body) => request('/bookings', { method: 'POST', body: JSON.stringify(body) }),
  payBooking: (id) => request(`/bookings/${id}/pay`, { method: 'POST' }),
  getSportsBookings: () => request('/sports/bookings'),
  updateSportsBooking: (id, status) => request(`/sports/bookings/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getHistory: (phone) => request(`/history?phone=${phone}`),
};
