const mongoose = require('mongoose');
const Company = require('./models/Company');

mongoose.connect('mongodb://localhost:27017/visitify', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function listCompanies() {
  const companies = await Company.find({}, { name: 1, email: 1 });
  if (companies.length === 0) {
    console.log('No companies found.');
  } else {
    console.log('Companies in database:');
    companies.forEach(c => {
      console.log(`ID: ${c._id} | Name: ${c.name} | Email: ${c.email}`);
    });
  }
  process.exit();
}

listCompanies(); 