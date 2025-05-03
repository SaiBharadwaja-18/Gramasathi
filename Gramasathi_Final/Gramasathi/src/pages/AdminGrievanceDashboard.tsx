import React, { useEffect, useState } from 'react';
import { useAuth } from '.././hooks/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Grievance {
  _id: string;
  description: string;
  location: string;
  image?: string;
  user: { name: string; email: string };
  createdAt: string;
}

const AdminGrievanceDashboard: React.FC = () => {
  const { token, user, logout } = useAuth();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGrievances = async () => {
      if (user?.role !== 'admin') return;

      try {
        const res = await fetch('http://localhost:5002/api/grievances', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (data.success) {
          setGrievances(data.grievances);
        }
      } catch (err) {
        console.error('Error loading grievances:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGrievances();
  }, [token, user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (user?.role !== 'admin') return <p className="text-red-500">Unauthorized</p>;
  if (loading) return <p>Loading grievances...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Grievances Submitted</h2>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
      <div className="space-y-4">
        {grievances.map((g) => (
          <div key={g._id} className="border p-4 rounded-md shadow">
            <p><strong>User:</strong> {g.user.name} ({g.user.email})</p>
            <p><strong>Description:</strong> {g.description}</p>
            <p><strong>Location:</strong> {g.location}</p>
            <p><strong>Date:</strong> {new Date(g.createdAt).toLocaleString()}</p>
            {g.image && (
              <img
                src={`http://localhost:5002/uploads/${g.image}`}
                alt="Grievance"
                className="mt-2 h-40 object-cover rounded"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminGrievanceDashboard;
