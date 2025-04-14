import React, { useState } from 'react';
import axios from 'axios';
import './SubmitResume.css';
import ResumeViewer from '../resumeViewer';

function SubmitResume() {
  const [file, setFile] = useState(null);
  const [resume, setResume] = useState("");
  const [saving, setSaving] = useState(false);
  const [load, setLoad] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setLoad(true);

    try {
      const response = await axios.post('http://localhost:8000/pdf_to_text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("Response from backend:", response.data);
      setResume(response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
    setLoad(false);
  };

  const handleSaveResume = async () => {
    if (!resume) return;
    
    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        'http://localhost:8000/save_resume',
        resume,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('Resume saved successfully!');
      console.log('Save response:', response.data);
    } catch (error) {
      console.error('Error saving resume:', error);
      alert('Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container">
  <h2>Submit Resume</h2>
  <div className="file-upload">
    <input type="file" onChange={handleFileChange} />
    <button onClick={handleSubmit} className="submit-btn">
    {load ? 'Loading...' : 'Submit'}
    </button>
  </div>

  {resume && (
    <div className="resume-preview">
      <ResumeViewer resume={resume} />
      <button
        onClick={handleSaveResume}
        disabled={saving}
        className="save-btn"
      >
        {saving ? 'Saving...' : 'Save Resume'}
      </button>
    </div>
  )}
</div>
  );
}

export default SubmitResume;
