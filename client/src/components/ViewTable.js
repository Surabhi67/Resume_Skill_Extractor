import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ViewTable.css';

function ViewTable() {
  const [resumes, setResumes] = useState([]);
  const [filteredResumes, setFilteredResumes] = useState([]);
  const [selectedResumes, setSelectedResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/resumes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setResumes(response.data);
      setFilteredResumes(response.data);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = resumes.filter((resume) =>
      Object.values(resume).some((value) =>
        JSON.stringify(value).toLowerCase().includes(query)
      )
    );
    setFilteredResumes(filtered);
  };

  const handleSelectResume = (id) => {
    setSelectedResumes((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedResumes.length === filteredResumes.length) {
      setSelectedResumes([]);
    } else {
      setSelectedResumes(filteredResumes.map((resume) => resume.id));
    }
  };

  const handleDelete = async (ids) => {
    const token = localStorage.getItem('token');
    try {
      await Promise.all(
        ids.map((id) =>
          axios.delete(`http://localhost:8000/resumes/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
      );
      fetchResumes();
      setSelectedResumes([]);
    } catch (error) {
      console.error('Error deleting resumes:', error);
    }
  };

  if (loading) {
    return <div className="loading-message">Loading...</div>;
  }

  return (
    <div className="view-table">
      <h2>Saved Resumes</h2>

      <input
        type="text"
        placeholder="Search resumes..."
        value={searchQuery}
        onChange={handleSearch}
        style={searchInputStyle}
      />

      {selectedResumes.length > 0 && (
        <button onClick={() => handleDelete(selectedResumes)} style={deleteButtonStyle}>
          Delete Selected ({selectedResumes.length})
        </button>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedResumes.length === filteredResumes.length}
                />
              </th>
              <th style={tableHeaderStyle}>Name</th>
              <th style={tableHeaderStyle}>Email</th>
              <th style={tableHeaderStyle}>Phone</th>
              <th style={tableHeaderStyle}>Skills</th>
              <th style={tableHeaderStyle}>Work Experience</th>
              <th style={tableHeaderStyle}>Projects</th>
              <th style={tableHeaderStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredResumes.map((resume) => (
              <tr key={resume.id}>
                <td style={tableCellStyle}>
                  <input
                    type="checkbox"
                    checked={selectedResumes.includes(resume.id)}
                    onChange={() => handleSelectResume(resume.id)}
                  />
                </td>
                <td style={tableCellStyle}>{resume.name}</td>
                <td style={tableCellStyle}>{resume.email}</td>
                <td style={tableCellStyle}>{resume.phone}</td>
                <td style={tableCellStyle}>
                  <div>
                    <strong>Technical:</strong>
                    <ul style={{ paddingLeft: '1.2rem' }}>
                      {resume.skills?.technical?.map((skill, index) => (
                        <li key={index}>{skill}</li>
                      ))}
                    </ul>
                    <strong>Soft:</strong>
                    <ul style={{ paddingLeft: '1.2rem' }}>
                      {resume.skills?.soft?.map((skill, index) => (
                        <li key={index}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                </td>
                <td style={tableCellStyle}>
                  {resume.workExperience?.map((job, index) => (
                    <div key={index} style={{ marginBottom: '1rem' }}>
                      <strong>{job.role}</strong> at <em>{job.company}</em>
                      <p style={{ margin: 0, color: '#777' }}>{job.years}</p>
                    </div>
                  ))}
                </td>
                <td style={tableCellStyle}>
                  {resume.projects?.map((project, index) => (
                    <div key={index} style={{ marginBottom: '1rem' }}>
                      <strong>{project.name}</strong>
                      <p style={{ margin: 0, color: '#777' }}>
                        Tech: {project.technology}
                      </p>
                    </div>
                  ))}
                </td>
                <td style={tableCellStyle}>
                  <button onClick={() => handleDelete([resume.id])} style={deleteBtnStyle}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Inline styles
const tableStyle = {
  width: '100%',
  minWidth: '900px',
  borderCollapse: 'collapse',
  marginTop: '20px',
};

const searchInputStyle = {
  marginBottom: '15px',
  padding: '8px',
  width: '100%',
  borderRadius: '4px',
  border: '1px solid #ccc',
};

const tableHeaderStyle = {
  backgroundColor: '#f4f4f4',
  padding: '12px',
  textAlign: 'left',
  borderBottom: '2px solid #ddd',
};

const tableCellStyle = {
  padding: '12px',
  borderBottom: '1px solid #ddd',
  verticalAlign: 'top',
};

const deleteBtnStyle = {
  backgroundColor: '#e74c3c',
  color: 'white',
  border: 'none',
  padding: '6px 10px',
  borderRadius: '4px',
  cursor: 'pointer',
};

const deleteButtonStyle = {
  marginBottom: '10px',
  padding: '8px 12px',
  backgroundColor: '#c0392b',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

export default ViewTable;
