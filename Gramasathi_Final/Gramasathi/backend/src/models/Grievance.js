// models/Grievance.js
import mongoose from 'mongoose';

const grievanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  image: {
    type: String // this will store just the filename, e.g. 'abc123.png'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Grievance = mongoose.model('Grievance', grievanceSchema);
export default Grievance;
