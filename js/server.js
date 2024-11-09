const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/registrations', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const RegistrationSchema = new mongoose.Schema({
  parent: {
    firstName: String,
    lastName: String,
    idNumber: String,
    email: String,
    phone: String,
    address: String,
    emergencyContact: {
      name: String,
      phone: String,
    },
  },
  child: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    gender: String,
    program: String,
    medicalInfo: {
      conditions: String,
      allergies: String,
      medications: String,
    },
  },
  payment: {
    cardholderName: String,
    paymentProof: String,
  },
  createdAt: { type: Date, default: Date.now },
});

const Registration = mongoose.model('Registration', RegistrationSchema);

// Endpoint to save registration
app.post('/register', async (req, res) => {
  try {
    const registration = new Registration(req.body);
    await registration.save();
    res
      .status(200)
      .json({ success: true, message: 'Registration saved successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Registration failed', error });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
