import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [resumes, setResumes] = useState([]);
  const [features, setFeatures] = useState({
    download: true,
    email: true,
    whatsapp: true,
    print: true,
    password: true
  });
  const [loading, setLoading] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null); // For modal
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchResumes();
    fetchFeatures();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://resume-builder-c1tz.onrender.com/api/resumes/admin/all");
      setResumes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeatures = async () => {
    try {
      const res = await axios.get("https://resume-builder-c1tz.onrender.com/api/feature");
      setFeatures(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteResume = async (id) => {
    if (!window.confirm("Delete this resume?")) return;

    try {
      await axios.delete(`https://resume-builder-c1tz.onrender.com/api/resumes/admin/${id}`);
      fetchResumes();
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFeature = async (key) => {
    const updated = { ...features, [key]: !features[key] };
    setFeatures(updated);

    try {
      await axios.post("https://resume-builder-c1tz.onrender.com/api/feature", updated);
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (resume) => {
    setSelectedResume(resume);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedResume(null);
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Header */}
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
        Admin Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow text-center">
          <h2 className="text-lg font-semibold">Total Resumes</h2>
          <p className="text-2xl font-bold text-blue-500">{resumes.length}</p>
        </div>

        <div className="bg-white p-4 rounded shadow text-center">
          <h2 className="text-lg font-semibold">Total Downloads</h2>
          <p className="text-2xl font-bold text-green-500">
            {resumes.reduce((acc, r) => acc + r.downloads, 0)}
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow text-center">
          <h2 className="text-lg font-semibold">Active Features</h2>
          <p className="text-2xl font-bold text-purple-500">
            {Object.values(features).filter(Boolean).length}
          </p>
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Feature Controls</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.keys(features).map((key) => (
            <button
              key={key}
              onClick={() => toggleFeature(key)}
              className={`p-3 rounded text-white font-semibold transition transform hover:scale-105 ${
                features[key] ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {key.toUpperCase()} : {features[key] ? "ON" : "OFF"}
            </button>
          ))}
        </div>
      </div>

      {/* Resume Table */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Resume Records</h2>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Downloads</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {resumes.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center p-4">No resumes found</td>
                  </tr>
                ) : (
                  resumes.map((r) => (
                    <tr key={r._id} className="text-center border-t hover:bg-gray-100">
                      <td className="p-3">{r.name}</td>
                      <td className="p-3">{r.email}</td>
                      <td className="p-3">{r.downloads}</td>
                      <td className="p-3 flex justify-center gap-2">
                        <button
                          onClick={() => openModal(r)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition"
                        >
                          View
                        </button>
                        <button
                          onClick={() => deleteResume(r._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resume Modal */}
      {modalOpen && selectedResume && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-11/12 md:w-2/3 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">{selectedResume.name}</h2>
            <p><strong>Email:</strong> {selectedResume.email}</p>
            <p><strong>Phone:</strong> {selectedResume.phone}</p>
            <p><strong>LinkedIn/GitHub:</strong> {selectedResume.linkedIn}</p>
            <p className="mt-2"><strong>Summary:</strong> {selectedResume.summary}</p>

            <div className="mt-4">
              <strong>Skills:</strong>
              <ul className="list-disc list-inside">
                {selectedResume.skills.map((skill, idx) => (
                  <li key={idx}>{skill}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <strong>Education:</strong>
              <ul className="list-disc list-inside">
                {selectedResume.education.map((edu, idx) => (
                  <li key={idx}>
                    {edu.degree} - {edu.institute} ({edu.year})
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <strong>Experience:</strong>
              <ul className="list-disc list-inside">
                {selectedResume.experience.map((exp, idx) => (
                  <li key={idx}>
                    {exp.title} at {exp.company} ({exp.duration})
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Close
              </button>
              <button
                onClick={() => deleteResume(selectedResume._id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
