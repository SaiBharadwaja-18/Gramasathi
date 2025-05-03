import mongoose from 'mongoose';

const WorkerSchema = new mongoose.Schema({
  name: String,
  skill: String,
  availability: String,
  location: String,
  contact: String,
});

export default mongoose.model('Worker', WorkerSchema);