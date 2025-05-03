import mongoose from 'mongoose';

const ApplicantSchema = new mongoose.Schema({
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobRequest',
  },
  worker_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
  },
  status: {
    type: String,
    default: 'Pending',
  }
});

export default mongoose.model('Applicant', ApplicantSchema);
