import { useState } from "react";
import axios from "axios";

export default function ResumeForm({ data, setData }) {
  const [skill, setSkill] = useState("");
  const [education, setEducation] = useState({ degree: "", institute: "", year: "" });
  const [experience, setExperience] = useState({ title: "", company: "", duration: "" });
  const [savedResumeId, setSavedResumeId] = useState(null); // store the MongoDB _id after saving

  // Add Skill
  const addSkill = () => {
    const trimmedSkill = skill.trim();
    if (!trimmedSkill) return;
    if (data.skills.includes(trimmedSkill)) {
      alert(`Duplicate skill detected: ${trimmedSkill}`);
      return;
    }
    setData({ ...data, skills: [...data.skills, trimmedSkill] });
    setSkill("");
  };

  // Add Education
  const addEducation = () => {
    if (!education.degree || !education.institute || !education.year) {
      alert("Please fill all education fields");
      return;
    }
    setData({ ...data, education: [...data.education, education] });
    setEducation({ degree: "", institute: "", year: "" });
  };

  // Add Experience
  const addExperience = () => {
    if (!experience.title || !experience.company || !experience.duration) {
      alert("Please fill all experience fields");
      return;
    }
    setData({ ...data, experience: [...data.experience, experience] });
    setExperience({ title: "", company: "", duration: "" });
  };

  // Submit Resume
  const handleSubmit = async () => {
    try {
      const res = await axios.post("https://resume-builder-c1tz.onrender.com/api/resumes", data);
      alert("Resume saved successfully!");
      setSavedResumeId(res.data._id); // save MongoDB _id for download
      console.log("Saved resume:", res.data);
    } catch (err) {
      console.error("Error saving resume:", err);
      alert("Failed to save resume. Check console.");
    }
  };

  // Download Resume PDF
const handleDownload = async (id) => {
  if (!id) return alert("Resume not saved yet!");

  try {
    const response = await axios.get(
      `https://resume-builder-c1tz.onrender.com/api/resumes/download/${id}`,
      { responseType: "blob" }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `resume-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    alert("Download completed successfully!");
  } catch (error) {
    console.error("Error downloading PDF:", error);
    alert("Failed to download PDF.");
  }
};
  return (
    <div className="resume-form p-6 max-w-3xl mx-auto bg-white shadow-xl rounded-xl space-y-6">
      <h2 className="text-2xl font-bold text-center text-blue-600">Resume Builder</h2>

      {/* Personal Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Full Name"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          className="p-3 border rounded shadow-sm"
        />
        <input
          type="email"
          placeholder="Email"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          className="p-3 border rounded shadow-sm"
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={data.phone}
          onChange={(e) => setData({ ...data, phone: e.target.value })}
          className="p-3 border rounded shadow-sm"
        />
        <input
          type="text"
          placeholder="LinkedIn / GitHub"
          value={data.linkedIn}
          onChange={(e) => setData({ ...data, linkedIn: e.target.value })}
          className="p-3 border rounded shadow-sm"
        />
      </div>

      {/* Summary */}
      <textarea
        placeholder="Professional Summary / Objective"
        value={data.summary}
        onChange={(e) => setData({ ...data, summary: e.target.value })}
        className="w-full p-3 border rounded shadow-sm"
      />

      {/* Skills */}
      <div>
        <h3 className="font-semibold text-lg mb-2">Skills</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add skill"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={addSkill}
            className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {data.skills.map((s, idx) => (
            <span key={idx} className="bg-gray-200 px-2 py-1 rounded flex items-center gap-1">
              {s}
              <button
                onClick={() =>
                  setData({ ...data, skills: data.skills.filter((_, i) => i !== idx) })
                }
                className="text-red-500 font-bold"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Education */}
      <div>
        <h3 className="font-semibold text-lg mb-2">Education</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
          <input
            type="text"
            placeholder="Degree"
            value={education.degree}
            onChange={(e) => setEducation({ ...education, degree: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Institute / University"
            value={education.institute}
            onChange={(e) => setEducation({ ...education, institute: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Year of Passing"
            value={education.year}
            onChange={(e) => setEducation({ ...education, year: e.target.value })}
            className="p-2 border rounded"
          />
          <button
            onClick={addEducation}
            className="col-span-full bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
          >
            Add Education
          </button>
        </div>
      </div>

      {/* Experience */}
      <div>
        <h3 className="font-semibold text-lg mb-2">Work Experience</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
          <input
            type="text"
            placeholder="Job Title"
            value={experience.title}
            onChange={(e) => setExperience({ ...experience, title: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Company"
            value={experience.company}
            onChange={(e) => setExperience({ ...experience, company: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Duration"
            value={experience.duration}
            onChange={(e) => setExperience({ ...experience, duration: e.target.value })}
            className="p-2 border rounded"
          />
          <button
            onClick={addExperience}
            className="col-span-full bg-purple-500 text-white px-4 py-1 rounded hover:bg-purple-600"
          >
            Add Experience
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center mt-4">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 shadow-md"
        >
          Submit Resume
        </button>
        <button
          onClick={() => handleDownload(savedResumeId)}
          disabled={!savedResumeId} // disabled until resume saved
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
}
