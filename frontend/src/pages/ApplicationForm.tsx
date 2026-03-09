import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/api";
import CustomSelect from "../components/CustomSelect";

export default function ApplicationForm() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState<any>(null);
  const [assessmentSubmitted, setAssessmentSubmitted] = useState(false);
  const [checking, setChecking] = useState(true);

  const [formData, setFormData] = useState({
    contactNumber: "",
    homeState: "",
    assemblyConstituency: "",
    currentResidence: "",
    category: "",
    highestQualification: "",
    collegeYearOfStudy: "",
    collegeName: "",
    academicDiscipline: "",
    commit5Hours: false,
    hasLaptop: false,
    openToOnField: false,
    willingToWorkWithInc: false,
    punjabiProficiency: "",
    interestReason: "",
  });

  // Check if user already has an application
  useEffect(() => {
    const checkApplication = async () => {
      try {
        const { data } = await api.get("/applications/me");
        if (data.application) {
          setApplication(data.application);
          setAssessmentSubmitted(data.assessmentSubmitted);
        }
      } catch {
        // No application yet
      } finally {
        setChecking(false);
      }
    };
    checkApplication();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a resume file");
      return;
    }
    
    // Custom validation
    if (formData.interestReason.split(" ").length > 100) {
      toast.error("Reason for interest must be max 100 words");
      return;
    }

    setLoading(true);
    const payload = new FormData();
    payload.append("resume", file);
    Object.keys(formData).forEach(key => {
      payload.append(key, String(formData[key as keyof typeof formData]));
    });

    try {
      const { data } = await api.post("/applications", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setApplication(data.application);
      toast.success("Application submitted successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getStatusDisplay = (status: string) => {
    if (status === "pending") return "Application Submitted";
    if (status === "shortlisted") return "Assessment Pending";
    if (status === "rejected") return "Not Shortlisted";
    return status;
  };

  if (checking) {
    return (
      <div className="page-container">
        <div className="card">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <nav className="navbar">
        <span className="nav-title">Assessment Platform</span>
        <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
      </nav>

      <div className="card" style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <h2>Your Application</h2>

        {application ? (
          <div className="application-status">
            <p>
              <strong>Status:</strong>{" "}
              <span className={`badge badge-${application.status}`}>
                {getStatusDisplay(application.status).toUpperCase()}
              </span>
            </p>
            <p>
              <strong>Resume:</strong> {application.resumePath}
            </p>

            {application.status === "shortlisted" && !assessmentSubmitted && (
              <button
                className="btn btn-primary"
                onClick={() => navigate("/assessment")}
              >
                Start Assessment →
              </button>
            )}

            {assessmentSubmitted && (
              <div className="info-text success-text" style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(52, 211, 153, 0.1)', borderRadius: '8px', border: '1px solid var(--success)' }}>
                <p style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓ Assessment Completed</p>
                <p>You have successfully submitted your assessment. Our team will review your results and get back to you.</p>
              </div>
            )}

            {application.status === "pending" && (
              <p className="info-text">
                Your application is under review. Please check back later.
              </p>
            )}

            {application.status === "rejected" && (
              <p className="info-text danger-text">
                Your application has been not shortlisted.
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            <div className="form-group">
              <label>Contact Number *</label>
              <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required />
            </div>

            <div className="form-group" style={{ position: 'relative', zIndex: 10 }}>
              <label>Home State *</label>
              <CustomSelect
                value={formData.homeState}
                onChange={(val) => setFormData({...formData, homeState: val})}
                placeholder="Select State"
                required
                options={[
                  { label: "Punjab", value: "Punjab" },
                  { label: "Haryana", value: "Haryana" },
                  { label: "Rajasthan", value: "Rajasthan" },
                  { label: "Delhi", value: "Delhi" },
                  { label: "Uttar Pradesh", value: "Uttar Pradesh" },
                  { label: "Other", value: "Other" }
                ]}
              />
            </div>

            {formData.homeState === "Punjab" && (
              <div className="form-group">
                <label>Assembly Constituency *</label>
                <input type="text" name="assemblyConstituency" value={formData.assemblyConstituency} onChange={handleChange} required />
              </div>
            )}

            <div className="form-group">
              <label>Current state of residence *</label>
              <input type="text" name="currentResidence" value={formData.currentResidence} onChange={handleChange} required />
            </div>

            <div className="form-group" style={{ position: 'relative', zIndex: 9 }}>
              <label>Category (optional)</label>
              <CustomSelect
                value={formData.category}
                onChange={(val) => setFormData({...formData, category: val})}
                placeholder="Select Category"
                options={[
                  { label: "General", value: "General" },
                  { label: "OBC", value: "OBC" },
                  { label: "SC", value: "SC" },
                  { label: "ST", value: "ST" },
                  { label: "Prefer not to say", value: "Prefer not to say" }
                ]}
              />
            </div>

            <div className="form-group">
              <label>Highest Educational Qualification *</label>
              <input type="text" name="highestQualification" value={formData.highestQualification} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>If Currently Enrolled in College (Year & Name):</label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <input type="text" name="collegeYearOfStudy" placeholder="Current Year of Study" value={formData.collegeYearOfStudy} onChange={handleChange} style={{ flex: '1 1 200px' }} />
                <input type="text" name="collegeName" placeholder="College Name (or NA)" value={formData.collegeName} onChange={handleChange} style={{ flex: '2 1 300px' }} />
              </div>
            </div>

            <div className="form-group">
              <label>Academic Discipline/Field of study *</label>
              <input type="text" name="academicDiscipline" value={formData.academicDiscipline} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Upload Your Resume (PDF) *</label>
              <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="commit5Hours" checked={formData.commit5Hours} onChange={handleChange} style={{ width: 'auto' }} /> 
                <span>Can you commit a minimum of 5 hours per day?</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="hasLaptop" checked={formData.hasLaptop} onChange={handleChange} style={{ width: 'auto' }} /> 
                <span>Do you have access to a laptop with video conferencing?</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="openToOnField" checked={formData.openToOnField} onChange={handleChange} style={{ width: 'auto' }} /> 
                <span>Are you open to on-field work if required?</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="willingToWorkWithInc" checked={formData.willingToWorkWithInc} onChange={handleChange} style={{ width: 'auto' }} /> 
                <span>Are you willing to work with the Indian National Congress?</span>
              </label>
            </div>

            <div className="form-group" style={{ position: 'relative', zIndex: 4, marginTop: '1rem' }}>
              <label>Punjabi Proficiency (Reading & Writing) *</label>
              <CustomSelect
                value={formData.punjabiProficiency}
                onChange={(val) => setFormData({...formData, punjabiProficiency: val})}
                placeholder="Select Proficiency"
                required
                options={[
                  { label: "Basic", value: "Basic" },
                  { label: "Intermediate", value: "Intermediate" },
                  { label: "Advance", value: "Advance" },
                  { label: "Not proficient", value: "Not proficient" }
                ]}
              />
            </div>

            <div className="form-group">
              <label>Why are you interested in contributing to state-level elections? (Max 100 words) *</label>
              <textarea name="interestReason" rows={4} value={formData.interestReason} onChange={handleChange} required></textarea>
              <small style={{ color: '#666' }}>Words: {formData.interestReason.split(/\s+/).filter(Boolean).length}/100</small>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
