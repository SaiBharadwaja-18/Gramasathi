import React, { useEffect, useState } from 'react';

const JobBoard: React.FC = () => {
  const [jobRequests, setJobRequests] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<any | null>(null);
  const [isEmployer, setIsEmployer] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      const [jobRes, workerRes, applicantRes] = await Promise.all([
        fetch('http://localhost:5002/api/jobs'),
        fetch('http://localhost:5002/api/workers'),
        fetch('http://localhost:5002/api/applicants'),
      ]);

      const jobs = await jobRes.json();
      const workers = await workerRes.json();
      const apps = await applicantRes.json();

      setJobRequests(jobs || []);
      setWorkers(workers || []);
      setApplicants(apps || []);
    };

    fetchData();
  }, []);

  const handleApply = async (jobId: string) => {
    if (!selectedWorker) {
      alert("Please select a worker before applying.");
      return;
    }

    const alreadyApplied = applicants.some(app =>
      app.job_id === jobId && app.worker_id === selectedWorker._id
    );

    const job = jobRequests.find(job => job._id === jobId);
    if (!job) return;

    if (alreadyApplied) {
      alert('⚠️ You have already applied for this job.');
      return;
    }

    if (job.filled >= job.slots) {
      alert('All slots are filled.');
      return;
    }

    const newApplicant = {
      job_id: jobId,
      worker_id: selectedWorker._id,
      status: 'Pending',
    };

    await fetch('http://localhost:5002/api/applicants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newApplicant),
    });

    setApplicants(prev => [...prev, newApplicant]);
    setJobRequests(prev =>
      prev.map(j =>
        j._id === jobId ? { ...j, filled: j.filled + 1 } : j
      )
    );

    alert('✅ Applied successfully!');
  };

  const handleStatusUpdate = (jobId: string, workerId: string, newStatus: string) => {
    setApplicants(prev =>
      prev.map(app =>
        app.job_id === jobId && app.worker_id === workerId
          ? { ...app, status: newStatus }
          : app
      )
    );
  };

  const getApplicantsForJob = (jobId: string) => {
    return applicants
      .filter(app => app.job_id === jobId)
      .map(app => {
        const worker = workers.find(w => w._id === app.worker_id);
        return {
          ...app,
          name: worker?.name,
          skill: worker?.skill,
          location: worker?.location,
        };
      });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold mb-4 text-primary-600">Available Job Requests</h1>
        <button
          onClick={() => setIsEmployer(!isEmployer)}
          className="bg-yellow-400 px-3 py-1 rounded shadow text-sm"
        >
          Switch to {isEmployer ? 'Worker' : 'Employer'} View
        </button>
      </div>

      {!isEmployer && (
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Select Worker:</label>
          <select
            className="p-2 border border-gray-300 rounded w-full max-w-sm"
            onChange={(e) => {
              const worker = workers.find((w: any) => w._id === e.target.value);
              setSelectedWorker(worker);
            }}
          >
            <option value="">-- Choose Worker --</option>
            {workers.map((worker: any) => (
              <option key={worker._id} value={worker._id}>
                {worker.name} ({worker.skill} - {worker.location})
              </option>
            ))}
          </select>
        </div>
      )}

      {jobRequests.length === 0 && <p>No jobs posted yet.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobRequests
          .filter(job =>
            isEmployer ||
            !selectedWorker ||
            (job.skill === selectedWorker.skill && job.location === selectedWorker.location)
          )
          .map(job => {
            const jobApplicants = getApplicantsForJob(job._id);
            const hasApplied = jobApplicants.some((app: any) => app.worker_id === selectedWorker?._id);

            return (
              <div key={job._id} className="border rounded p-4 shadow">
                <h2 className="text-xl font-semibold text-primary-700">{job.title}</h2>
                <p className="text-gray-700">Skill: {job.skill}</p>
                <p className="text-gray-700">Location: {job.location}</p>
                <p className="text-gray-700">Date: {job.date}</p>
                <p className="text-gray-700">Slots: {job.filled}/{job.slots} filled</p>

                {!isEmployer && (
                  job.filled >= job.slots ? (
                    <p className="mt-3 text-red-500 font-semibold">All slots filled</p>
                  ) : hasApplied ? (
                    <p className="mt-3 text-blue-500 font-semibold">You have already applied</p>
                  ) : (
                    <button
                      onClick={() => handleApply(job._id)}
                      className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Apply
                    </button>
                  )
                )}

                {jobApplicants.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-gray-600">Applicants:</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {jobApplicants.map((app: any, idx: number) => (
                        <li key={idx} className="flex items-center justify-between">
                          <span>{app.name} ({app.skill}, {app.location})</span>
                          {isEmployer ? (
                            <select
                              className="ml-2 p-1 border rounded text-sm"
                              value={app.status}
                              onChange={(e) => handleStatusUpdate(job._id, app.worker_id, e.target.value)}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Selected">Selected</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          ) : (
                            <span className="ml-2 px-2 py-1 bg-gray-100 rounded">{app.status}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default JobBoard;
