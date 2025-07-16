const mongoose = require('mongoose');
const Company = require('./models/Company');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/visitify', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function seed() {
  // 1. Create a company
  const company = await Company.create({
    name: 'Demo Company',
    email: 'demo@company.com',
    phone: '+1234567890',
    address: {
      street: '123 Main St',
      city: 'Metropolis',
      state: 'State',
      country: 'Country',
      zipCode: '12345'
    },
    logo: null,
    subscription: {
      planId: new mongoose.Types.ObjectId(), // Replace with a real plan if needed
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      autoRenew: true
    },
    settings: {
      timezone: 'UTC',
      language: 'English'
    }
  });
  console.log('Seeded company:', company);

  // 2. Create an admin user linked to this company
  const user = await User.create({
    name: 'Admin User',
    email: 'admin@company.com',
    password: 'password123', // Make sure your User model hashes this
    phone: '+1234567890',
    role: 'company_admin',
    companyId: company._id
  });
  console.log('Seeded user:', user);

  process.exit();
}

seed(); 