import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/api";

interface ApplicationItem {
  _id: string;
  userId: { name: string; email: string };
  resumePath: string;
  status: string;
  contactNumber: string;
  homeState: string;
  assemblyConstituency?: string;
  currentResidence: string;
  category?: string;
  highestQualification: string;
  collegeYearOfStudy?: string;
  collegeName?: string;
  academicDiscipline: string;
  commit5Hours: boolean;
  hasLaptop: boolean;
  openToOnField: boolean;
  willingToWorkWithInc: boolean;
  punjabiProficiency: string;
  interestReason: string;
}

interface ResultItem {
  attemptId: string;
  candidateName: string;
  email: string;
  score: number;
  totalQuestions: number;
  percentage: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"applications" | "results" | "questions">("applications");
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState({ text: "", options: ["", "", "", ""], correctAnswer: 0 });
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);

  // Fetch data when tab changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (tab === "applications") {
          const { data } = await api.get("/admin/applications");
          setApplications(data.applications);
        } else if (tab === "results") {
          const { data } = await api.get("/admin/results");
          setResults(data.results);
        } else if (tab === "questions") {
          const { data } = await api.get("/questions");
          setQuestions(data.questions);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tab]);

  /**
   * Approve or reject a candidate's application.
   */
  const handleStatusChange = async (id: string, status: "shortlisted" | "rejected") => {
    try {
      await api.put(`/admin/applications/${id}/status`, { status });
      toast.success(`Application ${status}`);

      // Update local state
      setApplications((prev) =>
        prev.map((app) => (app._id === id ? { ...app, status } : app))
      );
      if (selectedApp?._id === id) {
        setSelectedApp({ ...selectedApp, status });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  /**
   * Download results as CSV.
   */
  const handleExportCsv = async () => {
    try {
      const response = await api.get("/admin/results/export", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "results.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("CSV exported!");
    } catch {
      toast.error("Export failed");
    }
  };

  const handleEditClick = (q: any) => {
    const id = q._id || q.id;
    setEditingQuestionId(id);
    setNewQuestion({ text: q.text, options: q.options, correctAnswer: q.correctAnswer });
    // Scroll to top form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setNewQuestion({ text: "", options: ["", "", "", ""], correctAnswer: 0 });
  };

  const handleDeleteQuestion = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click edit
    if (!id) {
      toast.error("Invalid question ID");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      console.log("Deleting question with ID:", id);
      await api.delete(`/questions/${id}`);
      setQuestions(questions.filter(q => (q._id || q.id) !== id));
      if (editingQuestionId === id) {
        handleCancelEdit();
      }
      toast.success("Question deleted!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete question");
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.text || newQuestion.options.some(o => !o)) {
      toast.error("All fields are required");
      return;
    }
    try {
      if (editingQuestionId) {
        const { data } = await api.put(`/questions/${editingQuestionId}`, newQuestion);
        setQuestions(questions.map(q => (q._id || q.id) === editingQuestionId ? data.question : q));
        toast.success("Question updated!");
      } else {
        const { data } = await api.post("/questions", newQuestion);
        setQuestions([...questions, data.question]);
        toast.success("Question added!");
      }
      setNewQuestion({ text: "", options: ["", "", "", ""], correctAnswer: 0 });
      setEditingQuestionId(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${editingQuestionId ? 'update' : 'add'} question`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="page-container">
      <nav className="navbar">
        <span className="nav-title">Admin Dashboard</span>
        <button className="btn btn-outline" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      {/* Tab navigation */}
      <div className="tab-bar">
        <button
          className={`tab-btn ${tab === "applications" ? "active" : ""}`}
          onClick={() => setTab("applications")}
        >
          Applications
        </button>
        <button
          className={`tab-btn ${tab === "results" ? "active" : ""}`}
          onClick={() => setTab("results")}
        >
          Results
        </button>
        <button
          className={`tab-btn ${tab === "questions" ? "active" : ""}`}
          onClick={() => setTab("questions")}
        >
          Questions
        </button>
      </div>

      {loading ? (
        <div className="card"><p>Loading...</p></div>
      ) : tab === "applications" ? (
        <div className="card">
          <h2>Candidate Applications</h2>
          {applications.length === 0 ? (
            <p className="info-text">No applications yet.</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Details</th>
                    {/* <th>Resume</th> */}
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id}>
                      <td>{app.userId.name}</td>
                      <td>{app.userId.email}</td>
                      <td>
                        <button 
                          className="link" 
                          style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer' }}
                          onClick={() => setSelectedApp(app)}
                        >
                          View Details
                        </button>
                      </td>
                      {/* <td>
                        <a
                          href={`http://localhost:5000/uploads/${app.resumePath}`}
                          target="_blank"
                          rel="noreferrer"
                          className="link"
                        >
                          View Resume
                        </a>
                      </td> */}
                      <td>
                        <span className={`badge badge-${app.status}`}>
                          {app.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {app.status === "pending" && (
                          <div className="action-buttons">
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleStatusChange(app._id, "shortlisted")}
                            >
                              Shortlist
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleStatusChange(app._id, "rejected")}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : tab === "results" ? (
        <div className="card">
          <div className="results-header">
            <h2>Assessment Results</h2>
            <button className="btn btn-primary" onClick={handleExportCsv}>
              Export CSV
            </button>
          </div>
          {results.length === 0 ? (
            <p className="info-text">No results yet.</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Score</th>
                    <th>Total</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.attemptId}>
                      <td>{r.candidateName}</td>
                      <td>{r.email}</td>
                      <td>{r.score}</td>
                      <td>{r.totalQuestions}</td>
                      <td>{r.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : tab === "questions" ? (
        <div className="card">
          <h2>Manage Questions</h2>
          <form onSubmit={handleCreateQuestion} style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '8px' }}>
            <h4 style={{ color: 'var(--text-primary)' }}>{editingQuestionId ? "Edit MCQ" : "Add New MCQ"}</h4>
            <div className="form-group">
              <label>Question Text</label>
              <input type="text" value={newQuestion.text} onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})} required />
            </div>
            {newQuestion.options.map((opt, i) => (
              <div key={i} className="form-group" style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                <input type="radio" name="correctAnswer" title="Mark as correct answer" checked={newQuestion.correctAnswer === i} onChange={() => setNewQuestion({...newQuestion, correctAnswer: i})} style={{ width: 'auto', margin: '0 12px 0 4px', cursor: 'pointer', transform: 'scale(1.2)' }} />
                <input type="text" placeholder={`Option ${i+1}`} value={opt} onChange={(e) => {
                  const newOptions = [...newQuestion.options];
                  newOptions[i] = e.target.value;
                  setNewQuestion({...newQuestion, options: newOptions});
                }} required style={{ flex: 1 }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary">{editingQuestionId ? "Save" : "Add Question"}</button>
              {editingQuestionId && (
                <button type="button" className="btn btn-outline" onClick={handleCancelEdit}>Cancel</button>
              )}
            </div>
          </form>

          <h3>Existing Questions</h3>
          {questions.length === 0 ? (
            <p className="info-text">No questions added yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {questions.map((q, idx) => {
                const qId = q._id || q.id;
                return (
                <div 
                  key={idx} 
                  onClick={() => handleEditClick(q)}
                  style={{ 
                    padding: '1rem', 
                    background: 'var(--surface)', 
                    border: `1px solid ${editingQuestionId === qId ? 'var(--accent)' : 'var(--border)'}`, 
                    borderRadius: '8px',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: editingQuestionId === qId ? '0 0 0 2px var(--accent-glow)' : 'none'
                  }}
                >
                  <button 
                    onClick={(e) => handleDeleteQuestion(qId, e)}
                    title="Delete question"
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--danger)',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0.8,
                      transition: 'opacity 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                  <p style={{ color: 'var(--text-primary)', paddingRight: '24px' }}><strong>Q{idx + 1}:</strong> {q.text}</p>
                  <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                    {q.options.map((o: string, i: number) => (
                      <li key={i} style={{ color: q.correctAnswer === i ? "var(--success)" : "var(--text-secondary)", fontWeight: q.correctAnswer === i ? "bold" : "normal" }}>
                        {o} {q.correctAnswer === i && "✓"}
                      </li>
                    ))}
                  </ul>
                </div>
              )})}
            </div>
          )}
        </div>
      ) : null}

      {/* Application Details Modal */}
      {selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Application Details: {selectedApp.userId.name}</h2>
              <button className="modal-close" onClick={() => setSelectedApp(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="details-section">
                <h3>Personal Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Full Name</span>
                    <span className="detail-value">{selectedApp.userId.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{selectedApp.userId.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Contact Number</span>
                    <span className="detail-value">{selectedApp.contactNumber}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Category</span>
                    <span className="detail-value">{selectedApp.category || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Location Details</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Home State</span>
                    <span className="detail-value">{selectedApp.homeState}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Current Residence</span>
                    <span className="detail-value">{selectedApp.currentResidence}</span>
                  </div>
                  {selectedApp.assemblyConstituency && (
                    <div className="detail-item">
                      <span className="detail-label">Assembly Constituency</span>
                      <span className="detail-value">{selectedApp.assemblyConstituency}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="details-section">
                <h3>Academic Background</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Highest Qualification</span>
                    <span className="detail-value">{selectedApp.highestQualification}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Academic Discipline</span>
                    <span className="detail-value">{selectedApp.academicDiscipline}</span>
                  </div>
                  {selectedApp.collegeName && (
                    <div className="detail-item">
                      <span className="detail-label">College Name</span>
                      <span className="detail-value">{selectedApp.collegeName}</span>
                    </div>
                  )}
                  {selectedApp.collegeYearOfStudy && (
                    <div className="detail-item">
                      <span className="detail-label">Year of Study</span>
                      <span className="detail-value">{selectedApp.collegeYearOfStudy}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="details-section">
                <h3>Commitments & Skills</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Availability (5+ Hours/Week)</span>
                    <span className={`detail-value boolean ${selectedApp.commit5Hours ? "" : "no"}`}>
                      {selectedApp.commit5Hours ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Owns Laptop</span>
                    <span className={`detail-value boolean ${selectedApp.hasLaptop ? "" : "no"}`}>
                      {selectedApp.hasLaptop ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Open to On-Field Work</span>
                    <span className={`detail-value boolean ${selectedApp.openToOnField ? "" : "no"}`}>
                      {selectedApp.openToOnField ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Willing to Work with INC</span>
                    <span className={`detail-value boolean ${selectedApp.willingToWorkWithInc ? "" : "no"}`}>
                      {selectedApp.willingToWorkWithInc ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Punjabi Proficiency</span>
                    <span className="detail-value">{selectedApp.punjabiProficiency}</span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Reason for Interest</h3>
                <p className="detail-value" style={{ lineHeight: '1.6', background: 'var(--surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  {selectedApp.interestReason}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <a
                  href={`https://assesment-platform-0t58.onrender.com/uploads/${selectedApp.resumePath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  View Resume
                </a>
                {selectedApp.status === "pending" && (
                  <>
                    <button
                      className="btn btn-success"
                      style={{ flex: 1 }}
                      onClick={() => handleStatusChange(selectedApp._id, "shortlisted")}
                    >
                      Shortlist
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ flex: 1 }}
                      onClick={() => handleStatusChange(selectedApp._id, "rejected")}
                    >
                      Reject
                    </button>
                  </>
                )}
                <div className={`badge badge-${selectedApp.status}`} style={{ display: 'flex', alignItems: 'center', padding: '0 20px', borderRadius: '8px' }}>
                  {selectedApp.status.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

