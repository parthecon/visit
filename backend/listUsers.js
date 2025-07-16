const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/visitify', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function listUsers() {
  const users = await User.find({}, { name: 1, email: 1, role: 1, companyId: 1 });
  if (users.length === 0) {
    console.log('No users found.');
  } else {
    console.log('Users in database:');
    users.forEach(u => {
      console.log(`ID: ${u._id} | Name: ${u.name} | Email: ${u.email} | Role: ${u.role} | companyId: ${u.companyId}`);
    });
  }
  process.exit();
}

listUsers(); 