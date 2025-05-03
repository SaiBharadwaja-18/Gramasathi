import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddJobRequest: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    skill: '',
    location: '',
    date: '',
    slots: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting job request:', form); // ✅ Debug log

    const newJob = {
      title: form.title,
      skill: form.skill,
      location: form.location,
      date: form.date,
      slots: parseInt(form.slots),
      filled: 0,
    };

    try {
      const res = await fetch('http://localhost:5002/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob),
      });

      const result = await res.json();
      console.log('Server response:', result); // ✅ Debug log

      if (res.ok) {
        alert('✅ Job posted successfully!');
        navigate('/job-board');
      } else {
        alert('❌ Failed to post job: ' + result.error);
      }
    } catch (err) {
      console.error('❌ Error submitting job request:', err);
      alert('❌ Network or server error.');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-primary-600 mb-6">Post a Job Request</h1>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Job Title"
          required
          className="p-2 border rounded"
        />
        <input
          name="skill"
          value={form.skill}
          onChange={handleChange}
          placeholder="Skill Required (e.g., Mason)"
          required
          className="p-2 border rounded"
        />
        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="Location"
          required
          className="p-2 border rounded"
        />
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          required
          className="p-2 border rounded"
        />
        <input
          name="slots"
          type="number"
          min="1"
          value={form.slots}
          onChange={handleChange}
          placeholder="Number of Workers Needed"
          required
          className="p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-green-700 text-white py-2 rounded hover:bg-green-800"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddJobRequest;
