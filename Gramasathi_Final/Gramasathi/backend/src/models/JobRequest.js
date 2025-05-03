import mongoose from 'mongoose';

const JobRequestSchema = new mongoose.Schema({
  title: String,
  skill: String,
  location: String,
  date: String,
  slots: Number,
  filled: {
    type: Number,
    default: 0
  }
});

export default mongoose.model('JobRequest', JobRequestSchema);
