const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/daycare',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

const ParentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  idNumber: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  emergencyContact: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
  },
});

const ChildSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, required: true },
  program: { type: String, required: true },
  medicalInfo: {
    conditions: String,
    allergies: String,
    medications: String,
  },
});

const RegistrationSchema = new mongoose.Schema({
  parent: ParentSchema,
  child: ChildSchema,
  proofOfPayment: {
    filename: String,
    path: String,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
});

const Registration = mongoose.model('Registration', RegistrationSchema);

// API Endpoint for registration
app.post('/api/register', upload.single('proofOfPayment'), async (req, res) => {
  try {
    const { parent, child } = req.body;

    const parentData = JSON.parse(parent);
    const childData = JSON.parse(child);

    const registration = new Registration({
      parent: parentData,
      child: childData,
      proofOfPayment: {
        filename: req.file.filename,
        path: req.file.path,
      },
    });

    await registration.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      registrationId: registration._id,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
});

// Serve static files from the uploads directory
app.use('/uploads', express.static('uploads'));

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({
    success: false,
    message: error.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
