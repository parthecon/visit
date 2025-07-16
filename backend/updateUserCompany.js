const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/visitify', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userEmail = 'admin@company.com'; // Change to your user's email
const newCompanyId = 'PUT_COMPANY_ID_HERE'; // Change to the correct company _id

async function updateUserCompany() {
  const result = await User.updateOne(
    { email: userEmail },
    { $set: { companyId: newCompanyId } }
  );
  if (result.modifiedCount > 0) {
    console.log(`Updated user ${userEmail} to companyId ${newCompanyId}`);
  } else {
    console.log('No user updated. Check the email and companyId.');
  }
  process.exit();
}

updateUserCompany(); 