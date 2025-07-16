const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: 'rzp_test_dummyid',
  key_secret: 'dummysecret',
});

module.exports = razorpay; 