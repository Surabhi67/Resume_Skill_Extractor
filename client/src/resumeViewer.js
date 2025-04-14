import React from "react";

const ResumeViewer = ({ resume }) => {
  if (!resume) return null;

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f9f9f9", borderRadius: "12px", maxWidth: "800px", margin: "2rem auto", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
      <h1 style={{ marginBottom: "0.5rem", fontSize: "2rem" }}>{resume.name}</h1>
      <p style={{ margin: "0", color: "#555" }}>{resume.email} | {resume.phone}</p>

      <hr style={{ margin: "1.5rem 0" }} />

      <section>
        <h2>Skills</h2>
        <div style={{ display: "flex", gap: "2rem" }}>
          <div>
            <h4>Technical</h4>
            <ul>
              {resume.skills?.technical?.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Soft</h4>
            <ul>
              {resume.skills?.soft?.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <hr style={{ margin: "1.5rem 0" }} />

      <section>
        <h2>Work Experience</h2>
        {resume.workExperience?.map((job, index) => (
          <div key={index} style={{ marginBottom: "1rem" }}>
            <strong>{job.role}</strong> at <em>{job.company}</em>
            <p style={{ margin: 0, color: "#777" }}>{job.years}</p>
          </div>
        ))}
      </section>

      <hr style={{ margin: "1.5rem 0" }} />

      <section>
        <h2>Projects</h2>
        {resume.projects?.map((project, index) => (
          <div key={index} style={{ marginBottom: "1rem" }}>
            <strong>{project.name}</strong>
            <p style={{ margin: 0, color: "#777" }}>Tech: {project.technology}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default ResumeViewer;
