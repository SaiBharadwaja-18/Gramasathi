import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddWorker: React.FC = () => {
  const navigate = useNavigate();

  const [worker, setWorker] = useState({
    name: '',
    skill: '',
    availability: '',
    location: '',
    contact: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorker({ ...worker, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting:', worker); // ✅ Debug log

    const res = await fetch('http://localhost:5002/api/workers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(worker),
    });

    const result = await res.json();
    console.log('Server response:', result); // ✅ Debug log

    if (res.ok) {
      alert('✅ Worker registered successfully!');
      navigate('/rozgar');
    } else {
      alert('❌ Failed to add worker: ' + result.error);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-primary-600 mb-6">Register as Worker</h1>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          required
          className="p-2 border rounded bg-blue-50"
          onChange={handleChange}
        />
        <input
          type="text"
          name="skill"
          placeholder="Skill (e.g. Mason)"
          required
          className="p-2 border rounded bg-blue-50"
          onChange={handleChange}
        />
        <input
          type="text"
          name="availability"
          placeholder="Availability (Daily/Weekly)"
          required
          className="p-2 border rounded bg-blue-50"
          onChange={handleChange}
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          required
          className="p-2 border rounded bg-blue-50"
          onChange={handleChange}
        />
        <input
          type="tel"
          name="contact"
          placeholder="Contact Number"
          required
          className="p-2 border rounded bg-blue-50"
          onChange={handleChange}
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

export default AddWorker;
