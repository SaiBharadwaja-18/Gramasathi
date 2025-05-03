// 📁 routes/rozgarRoutes.js
import express from 'express';
import Worker from '../models/Worker.js';
import JobRequest from '../models/JobRequest.js';
import Applicant from '../models/Applicant.js';
const router = express.Router();

// Worker routes
router.get('/workers', async (req, res) => {
  const workers = await Worker.find();
  res.json(workers);
});

router.post('/workers', async (req, res) => {
  try {
    const worker = new Worker(req.body);
    await worker.save();
    res.status(201).json({ message: 'Worker added successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Job routes
router.get('/jobs', async (req, res) => {
  const jobs = await JobRequest.find();
  res.json(jobs);
});

router.post('/jobs', async (req, res) => {
  try {
    const job = new JobRequest(req.body);
    await job.save();
    res.status(201).json({ message: 'Job added', job });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Applicant routes
router.get('/applicants', async (req, res) => {
  const data = await Applicant.find();
  res.json(data);
});

router.post('/applicants', async (req, res) => {
  try {
    const applicant = new Applicant(req.body);
    await applicant.save();
    res.status(201).json({ message: 'Application received' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
