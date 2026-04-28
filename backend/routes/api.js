const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { restaurants, orders, bookings, getMenuForRestaurant } = require('../data/seed');

// ── RESTAURANTS ──────────────────────────────────────────────────────────────

// GET /api/restaurants?category=Biryani&veg=true&search=novel
router.get('/restaurants', (req, res) => {
  let result = [...restaurants];

  if (req.query.category && req.query.category !== 'All') {
    result = result.filter(r => r.category === req.query.category);
  }
  if (req.query.veg === 'true') {
    result = result.filter(r => r.isVeg === true);
  }
  if (req.query.search) {
    const q = req.query.search.toLowerCase();
    result = result.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.cuisine.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q)
    );
  }
  if (req.query.featured === 'true') {
    result = result.filter(r => r.isFeatured);
  }

  res.json({ success: true, count: result.length, restaurants: result });
});

// GET /api/restaurants/:id
router.get('/restaurants/:id', (req, res) => {
  const restaurant = restaurants.find(r => r.id === req.params.id);
  if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
  res.json({ success: true, restaurant });
});

// GET /api/restaurants/:id/menu
router.get('/restaurants/:id/menu', (req, res) => {
  const restaurant = restaurants.find(r => r.id === req.params.id);
  if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
  const menu = getMenuForRestaurant(restaurant);
  res.json({ success: true, menu });
});

// ── ORDERS ───────────────────────────────────────────────────────────────────

// POST /api/orders  (Create order — pending payment)
router.post('/orders', (req, res) => {
  const { restaurantId, items, customerName, customerPhone } = req.body;

  if (!restaurantId || !items || !items.length) {
    return res.status(400).json({ success: false, message: 'restaurantId and items are required' });
  }

  const restaurant = restaurants.find(r => r.id === restaurantId);
  if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const orderId = `QS-${Date.now().toString(36).toUpperCase()}`;

  const order = {
    id: orderId,
    restaurantId,
    restaurantName: restaurant.name,
    items,
    total,
    customerName: customerName || 'Guest',
    customerPhone: customerPhone || '9999900000',
    paymentStatus: 'pending',   // pending | paid
    status: 'placed',           // placed | preparing | ready | delivered
    kitchenAccepted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  orders.push(order);
  console.log(`📋 New Order Created: ${orderId} | ₹${total} | ${restaurant.name}`);
  res.status(201).json({ success: true, order });
});

// GET /api/orders/:id
router.get('/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, order });
});

// POST /api/orders/:id/pay  (Confirm Payment — simulated)
router.post('/orders/:id/pay', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  order.paymentStatus = 'paid';
  order.status = 'preparing';
  order.kitchenAccepted = true;
  order.updatedAt = new Date().toISOString();
  order.transactionId = `TXN${Date.now()}`;

  console.log(`✅ Payment Confirmed: ${order.id} | Sent to Kitchen!`);
  res.json({ success: true, order, message: 'Payment confirmed. Order sent to kitchen!' });
});

// ── KITCHEN DASHBOARD ─────────────────────────────────────────────────────────

// GET /api/kitchen/orders   (All paid orders)
router.get('/kitchen/orders', (req, res) => {
  const activeOrders = orders
    .filter(o => o.paymentStatus === 'paid')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  res.json({ success: true, orders: activeOrders });
});

// PUT /api/kitchen/orders/:id   (Update status: preparing → ready → delivered)
router.put('/kitchen/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const { status } = req.body;
  const validStatuses = ['preparing', 'ready', 'delivered'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();

  console.log(`🍳 Kitchen Update: ${order.id} → ${status.toUpperCase()}`);
  res.json({ success: true, order });
});

// ── SERVICE BOOKINGS ──────────────────────────────────────────────────────────

const services = [
  { id: 's5', name: 'Power Play Guntur', icon: '🏏', pricePerHour: 500, location: 'Mahatma Gandhi Inner Ring Rd', slots: ['06:00', '07:00', '08:00', '09:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'] },
  { id: 's6', name: 'A1 cricket turf', icon: '🏏', pricePerHour: 500, location: 'Guntur - Ponnur Rd', slots: ['06:00', '07:00', '08:00', '09:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'] },
  { id: 's7', name: 'Sports Box', icon: '🏏', pricePerHour: 600, location: '8C9C+G95', slots: ['06:00', '07:00', '08:00', '09:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'] },
  { id: 's8', name: 'Buzzy Box Arena', icon: '🏏', pricePerHour: 500, location: 'Pedda Palakaluru Road', slots: ['06:00', '07:00', '08:00', '16:00', '17:00', '18:00', '19:00', '20:00'] },
  { id: 's9', name: 'Game on', icon: '🏏', pricePerHour: 400, location: 'Siddharth Nagar', slots: ['06:00', '07:00', '08:00', '09:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'] },
  { id: 's10', name: 'WePlay', icon: '🏏', pricePerHour: 500, location: 'Vidya Nagar', slots: ['06:00', '07:00', '08:00', '09:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'] },
  { id: 's11', name: 'I SpoRts Mania', icon: '🏏', pricePerHour: 450, location: 'Dr APJ Abdul Kalam Rd', slots: ['06:00', '07:00', '08:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'] },
  { id: 's12', name: 'ARENA 9', icon: '🏏', pricePerHour: 400, location: 'JKC College Rd', slots: ['06:00', '07:00', '08:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'] },
  { id: 's13', name: 'Sixers Sports Turf', icon: '🏏', pricePerHour: 500, location: 'Guntur Parchoor Rd', slots: ['06:00', '07:00', '08:00', '09:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'] },
  { id: 's14', name: 'Friends play turff', icon: '🏏', pricePerHour: 550, location: 'Jonnalagadda', slots: ['06:00', '07:00', '08:00', '09:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'] },
  { id: 's15', name: 'KSR Continuum', icon: '🏏', pricePerHour: 500, location: 'Amaravathi Rd', slots: ['06:00', '07:00', '08:00', '09:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'] },
  { id: 's16', name: '511 sports', icon: '🏏', pricePerHour: 500, location: '8CFP+JMX', slots: ['06:00', '07:00', '08:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'] },
  { id: 's17', name: 'STUMPS ZONE', icon: '🏏', pricePerHour: 600, location: 'Kakani Rd', slots: ['06:00', '07:00', '08:00', '16:00', '17:00', '18:00', '19:00', '20:00'] },
  { id: 's18', name: 'GT SPORTS', icon: '🏏', pricePerHour: 500, location: 'JKC College Rd', slots: ['06:00', '07:00', '08:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'] },
  { id: 's19', name: 'Pepsi Ground', icon: '🏏', pricePerHour: 400, location: '8C6C+RHW', slots: ['06:00', '07:00', '08:00', '09:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'] },
  { id: 's20', name: 'Allrounders Heaven', icon: '🏏', pricePerHour: 400, location: 'Gunta Ground Rd', slots: ['06:00', '07:00', '08:00', '16:00', '17:00', '18:00', '19:00', '20:00'] },
  { id: 's21', name: 'JKC College Ground', icon: '🏏', pricePerHour: 300, location: 'JKC College Road', slots: ['06:00', '07:00', '08:00', '09:00', '16:00', '17:00'] },
  { id: 's22', name: 'NTR Stadium', icon: '🏟️', pricePerHour: 200, location: 'Lakshmipuram Main Rd', slots: ['06:00', '07:00', '08:00', '16:00', '17:00', '18:00'] },
  { id: 's23', name: 'DenBox Guntur', icon: '🏏', pricePerHour: 500, location: 'Navy nest Pride', slots: ['06:00', '07:00', '08:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'] },
  // ── SWIMMING POOLS ────────────────────────────────────────────────────────
  { id: 's24', name: 'NTR Municipal Swimming Pool', icon: '🏊', pricePerHour: 100, location: 'Pattabhipuram', slots: ['05:00', '06:00', '07:00', '08:00', '16:00', '17:00', '18:00', '19:00'] },
  { id: 's25', name: 'VVIT Swimming Pool', icon: '🏊', pricePerHour: 150, location: 'Namburu', slots: ['06:00', '07:00', '16:00', '17:00'] },
  { id: 's26', name: 'Mahaboob Shamsher Khan Memorial Pool', icon: '🏊', pricePerHour: 100, location: 'Ganapathi Nagar', slots: ['06:00', '07:00', '08:00', '16:00', '17:00', '18:00'] },
  { id: 's27', name: 'Makineni Swimming Academy', icon: '🏊', pricePerHour: 200, location: 'LIC Colony', slots: ['06:00', '07:00', '08:00', '09:00', '16:00', '17:00', '18:00', '19:00'] },
  { id: 's28', name: 'KSR Continuum Swimming', icon: '🏊', pricePerHour: 400, location: 'Amaravathi Road', slots: ['06:00', '07:00', '08:00', '09:00', '16:00', '17:00', '18:00', '19:00', '20:00'] },
  { id: 's29', name: 'Swim & Play', icon: '🏊', pricePerHour: 250, location: 'Gorantla', slots: ['06:00', '07:00', '08:00', '09:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'] },
  { id: 's30', name: 'Guntur Club Swimming', icon: '🏊', pricePerHour: 300, location: 'Palakaluru Road', slots: ['06:00', '07:00', '08:00', '16:00', '17:00', '18:00', '19:00'] },
  { id: 's31', name: 'Happy Jump Pool', icon: '🏊', pricePerHour: 200, location: 'Guntur Highway', slots: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
  { id: 's32', name: 'Aqua Devils Welfare Association', icon: '🏊', pricePerHour: 150, location: 'Undavalli', slots: ['06:00', '07:00', '08:00', '16:00', '17:00', '18:00'] },
  { id: 's33', name: 'Speedway 7 Pool', icon: '🏊', pricePerHour: 250, location: 'Chowdavaram', slots: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'] },
  // ── FOOTBALL TURFS ────────────────────────────────────────────────────────
  { id: 's34', name: 'GameOn Football', icon: '⚽', pricePerHour: 800, location: 'Gujjannaguntla', slots: ['06:00', '07:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'] },
  { id: 's35', name: 'KSR Continuum Football', icon: '⚽', pricePerHour: 800, location: 'Amaravathi Road', slots: ['06:00', '07:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'] },
  { id: 's36', name: 'Sports Box Football', icon: '⚽', pricePerHour: 700, location: 'Navabharath Nagar', slots: ['06:00', '07:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'] },
  { id: 's37', name: 'Arena 9 Football', icon: '⚽', pricePerHour: 700, location: 'JKC College Road', slots: ['06:00', '07:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'] },
  { id: 's38', name: 'Happy Jump Football', icon: '⚽', pricePerHour: 600, location: 'Guntur Highway', slots: ['16:00', '17:00', '18:00', '19:00', '20:00', '21:00'] },
  { id: 's39', name: 'S Square Turfs', icon: '⚽', pricePerHour: 800, location: 'Tadepalli', slots: ['06:00', '07:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'] },
  { id: 's40', name: 'WePlay Football', icon: '⚽', pricePerHour: 700, location: 'Chandramouli Nagar', slots: ['06:00', '07:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'] },
  // ── BADMINTON COURTS ──────────────────────────────────────────────────────
  { id: 's41', name: 'NTR Municipal Stadium Badminton', icon: '🏸', pricePerHour: 200, location: 'Lakshmipuram', slots: ['06:00', '07:00', '08:00', '16:00', '17:00', '18:00', '19:00'] },
  { id: 's42', name: 'KSR Continuum Badminton', icon: '🏸', pricePerHour: 400, location: 'Amaravathi Road', slots: ['06:00', '07:00', '08:00', '09:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'] },
  { id: 's43', name: 'Venu Badminton Academy', icon: '🏸', pricePerHour: 300, location: 'SVN Colony', slots: ['06:00', '07:00', '08:00', '16:00', '17:00', '18:00', '19:00', '20:00'] },
  { id: 's44', name: 'Bulls Badminton Arena', icon: '🏸', pricePerHour: 350, location: 'Gorantla', slots: ['06:00', '07:00', '08:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'] },
  { id: 's45', name: 'Guntur Club Badminton', icon: '🏸', pricePerHour: 300, location: 'Palakaluru Road', slots: ['06:00', '07:00', '08:00', '16:00', '17:00', '18:00', '19:00', '20:00'] },
  { id: 's46', name: 'Guntur Medical College Stadium', icon: '🏸', pricePerHour: 150, location: 'Kanna Vari Thota', slots: ['06:00', '07:00', '08:00', '16:00', '17:00', '18:00', '19:00'] },
  { id: 's47', name: 'Happy Jump Badminton', icon: '🏸', pricePerHour: 250, location: 'Guntur Highway', slots: ['06:00', '07:00', '08:00', '16:00', '17:00', '18:00', '19:00', '20:00'] }
];

// GET /api/services
router.get('/services', (req, res) => {
  res.json({ success: true, services });
});

// GET /api/services/:id
router.get('/services/:id', (req, res) => {
  const service = services.find(s => s.id === req.params.id);
  if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
  res.json({ success: true, service });
});

// POST /api/bookings
router.post('/bookings', (req, res) => {
  const { serviceId, slotTime, customerName, customerPhone, date } = req.body;

  if (!serviceId || !slotTime) {
    return res.status(400).json({ success: false, message: 'serviceId and slotTime are required' });
  }

  const service = services.find(s => s.id === serviceId);
  if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

  // Check for conflicts
  const conflict = bookings.find(b =>
    b.serviceId === serviceId && b.slotTime === slotTime && b.date === (date || new Date().toISOString().slice(0, 10))
  );
  if (conflict) {
    return res.status(409).json({ success: false, message: 'Slot already booked! Please choose another time.' });
  }

  const bookingId = `BK-${Date.now().toString(36).toUpperCase()}`;
  const booking = {
    id: bookingId,
    serviceId,
    serviceName: service.name,
    slotTime,
    date: date || new Date().toISOString().slice(0, 10),
    customerName: customerName || 'Guest',
    customerPhone: customerPhone || '9999900000',
    price: service.pricePerHour,
    paymentStatus: 'pending',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  bookings.push(booking);
  console.log(`🏏 New Booking: ${bookingId} | ${service.name} @ ${slotTime}`);
  res.status(201).json({ success: true, booking });
});

// POST /api/bookings/:id/pay
router.post('/bookings/:id/pay', (req, res) => {
  const booking = bookings.find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  booking.paymentStatus = 'paid';
  booking.updatedAt = new Date().toISOString();
  booking.transactionId = `TXN${Date.now()}`;

  console.log(`✅ Booking Payment Confirmed: ${booking.id}`);
  res.json({ success: true, booking });
});

// ── SPORTS DASHBOARD ─────────────────────────────────────────────────────────

// GET /api/sports/bookings
router.get('/sports/bookings', (req, res) => {
  const activeBookings = bookings
    .filter(b => b.paymentStatus === 'paid')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  res.json({ success: true, bookings: activeBookings });
});

// PUT /api/sports/bookings/:id
router.put('/sports/bookings/:id', (req, res) => {
  const booking = bookings.find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  const { status } = req.body;
  const validStatuses = ['confirmed', 'checked-in', 'completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  booking.status = status;
  booking.updatedAt = new Date().toISOString();

  console.log(`🏟️ Sports Booking Update: ${booking.id} → ${status.toUpperCase()}`);
  res.json({ success: true, booking });
});

// ── USER HISTORY ──────────────────────────────────────────────────────────────

// GET /api/history
router.get('/history', (req, res) => {
  const { phone } = req.query;
  if (!phone) return res.status(400).json({ success: false, message: 'Phone is required' });

  // Exclude pending/abandoned carts for cleaner history if desired, but here we just send all for that phone
  const userOrders = orders.filter(o => o.customerPhone === phone).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const userBookings = bookings.filter(b => b.customerPhone === phone).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({ success: true, orders: userOrders, bookings: userBookings });
});

module.exports = router;
