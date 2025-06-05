import { useState, useEffect } from "react";
import styles from "./App.module.css";
import ProjectForm from "./components/ProjectForm/ProjectForm";
import ProjectList from "./components/ProjectList/ProjectList";
import ProjectDetail from "./components/ProjectDetail/ProjectDetail";
import { db } from "./firebase";
import { getProjects } from "./firebase/projects";

function App() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    getProjects(db)
      .then(setProjects)
      .catch(() => setError("Failed to load projects."));
  }, []);

  const openProjectDetail = (project) => setSelectedProject(project);
  const closeProjectDetail = () => setSelectedProject(null);

  const refreshProjects = () => {
    getProjects(db)
      .then(setProjects)
      .catch(() => setError("Failed to refresh projects."));
  };

  return (
    <div className={styles.app}>
      <h1 className={styles.title}>Project Ideas Notebook</h1>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.container}>
        <div className={styles.content}>
          <ProjectForm
            db={db}
            setError={setError}
            refreshProjects={refreshProjects}
          />
          <ProjectList
            projects={projects}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            openProjectDetail={openProjectDetail}
          />
        </div>
        {selectedProject && (
          <ProjectDetail
            project={selectedProject}
            onClose={closeProjectDetail}
            refreshProjects={refreshProjects}
          />
        )}
      </div>
    </div>
  );
}

export default App;
