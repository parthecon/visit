// backend/seedAnalyticsData.js
const mongoose = require('mongoose');
const Visitor = require('./models/Visitor');
const VisitLog = require('./models/VisitLog');
const User = require('./models/User');
const Company = require('./models/Company');
const SubscriptionPlan = require('./models/SubscriptionPlan');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/visitify';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear old data
  await VisitLog.deleteMany({});
  await Visitor.deleteMany({});
  await User.deleteMany({ role: { $ne: 'superadmin' } });
  await Company.deleteMany({});

  // Create subscription plan
  const plan = await SubscriptionPlan.create({
    name: 'Basic',
    description: 'Basic plan for small businesses',
    price: { monthly: 1999, yearly: 19990 },
    currency: 'INR',
    limits: { monthlyVisitors: 1000, employees: 20, locations: 1, storage: 500, apiCalls: 10000 },
    features: {},
    planType: 'starter',
    billingCycle: 'monthly',
    trialDays: 14,
    isActive: true,
    isPublic: true,
    sortOrder: 1,
  });

  // Create company
  const company = await Company.create({
    name: 'Acme Corp',
    email: 'info@acme.com',
    phone: '+1234567890',
    address: {
      street: '123 Main St',
      city: 'Metropolis',
      state: 'Stateville',
      country: 'Countryland',
      zipCode: '123456',
    },
    subscription: {
      planId: plan._id,
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  // Create hosts
  const hosts = await User.insertMany([
    { name: 'Alice Host', email: 'alice@acme.com', password: 'password', role: 'employee', companyId: company._id },
    { name: 'Bob Host', email: 'bob@acme.com', password: 'password', role: 'employee', companyId: company._id },
    { name: 'Carol Host', email: 'carol@acme.com', password: 'password', role: 'employee', companyId: company._id },
  ]);

  // Create visitors
  const visitorTypes = ['business', 'interview', 'delivery', 'meeting', 'other'];
  const statuses = ['pending', 'approved', 'checked_in', 'checked_out', 'rejected'];
  const now = new Date();
  const visitors = [];
  // Add 3 'checked_in' visitors for today
  for (let i = 0; i < 3; i++) {
    const host = hosts[Math.floor(Math.random() * hosts.length)];
    const visitor = await Visitor.create({
      name: `Today Visitor ${i + 1}`,
      email: `today${i + 1}@mail.com`,
      phone: `+123456789${i + 1}`,
      companyId: company._id,
      hostId: host._id,
      purpose: 'Business Meeting',
      visitorType: visitorTypes[Math.floor(Math.random() * visitorTypes.length)],
      status: 'checked_in',
      approvalStatus: 'approved',
      checkInTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9 + i, 0, 0),
      checkOutTime: null,
    });
    visitors.push(visitor);
  }
  // Add 17 more visitors with random statuses and times
  for (let i = 0; i < 17; i++) {
    const host = hosts[Math.floor(Math.random() * hosts.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const visitor = await Visitor.create({
      name: `Visitor ${i + 1}`,
      email: `visitor${i + 1}@mail.com`,
      phone: `+12345678${100 + i}`,
      companyId: company._id,
      hostId: host._id,
      purpose: 'Business Meeting',
      visitorType: visitorTypes[Math.floor(Math.random() * visitorTypes.length)],
      status,
      approvalStatus: status === 'rejected' ? 'rejected' : (status === 'approved' ? 'approved' : 'pending'),
      checkInTime: status === 'checked_in' || status === 'checked_out' ? new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
      checkOutTime: status === 'checked_out' ? new Date(now.getTime() - Math.random() * 6 * 24 * 60 * 60 * 1000) : null,
    });
    visitors.push(visitor);
  }

  // Create visit logs
  for (let i = 0; i < 40; i++) {
    const visitor = visitors[Math.floor(Math.random() * visitors.length)];
    const host = hosts.find(h => h._id.equals(visitor.hostId));
    const actions = ['checked_in', 'approved', 'checked_out', 'rejected'];
    const action = actions[Math.floor(Math.random() * actions.length)];
    await VisitLog.create({
      visitorId: visitor._id,
      companyId: company._id,
      hostId: host._id,
      action,
      timestamp: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      performedBy: host._id,
      duration: action === 'checked_out' ? Math.floor(Math.random() * 120) + 10 : null,
    });
  }

  console.log('Seeded test data!');
  await mongoose.disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); }); 