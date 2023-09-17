const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const otpGenerator = require('otp-generator');

app.use(bodyParser.json());
app.use(cors()); 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/IP_AUTH', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  phoneNumber: String,
  ipAddress: String,
  otp: String,
  isOTPValid: Boolean,
});
const User = mongoose.model('User', userSchema);

app.post('/register', async (req, res) => {
  const { username, password, phoneNumber, ipAddress } = req.body;

  // Implement IP validation logic here
  function ValidateIPaddress(ipaddress) {  
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {  
      return (true)  
    }  
    console.log("You have entered an invalid IP address!")  
    return (false)  
  } 

  ipAddress = ValidateIPaddress();

  const user = new User({
    username,
    password,
    phoneNumber,
    ipAddress,
  });

  try {
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

const twilio = require('twilio');
const jwt = require('jsonwebtoken');

// Twilio setup
const twilioClient = twilio('AC47444b9a449ef92660f605efee92eea2', 'a470d2c29aca0d02c118ad9eb246bd53');

// Generate OTP
function generateOTP() {
  // Implement OTP generation logic here
  otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
}

app.post('/generate-otp', async (req, res) => {
  const { phoneNumber } = req.body;
  const otp = generateOTP();

  // Send OTP via Twilio SMS
  try {
    await twilioClient.messages.create({
      to: phoneNumber,
      from: '7720922206',
      body: `Your OTP is: ${otp}`,
    });

    // Save OTP in the user record
    const user = await User.findOneAndUpdate({ phoneNumber }, { otp }, { new: true });

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/verify-otp', async (req, res) => {
  const { phoneNumber, otp } = req.body;

  // Implement OTP validation logic here

  if (valid) {
    // Generate JWT token for the user's session
    const token = jwt.sign({ phoneNumber }, 'YOUR_SECRET_KEY');
    res.status(200).json({ token });
  } else {
    res.status(401).json({ error: 'Invalid OTP' });
  }
});


