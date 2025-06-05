import styles from "./ProjectList.module.css";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";
import { techColors, techDocs } from "../../utils/techMeta";

function ProjectList({
  projects,
  searchQuery,
  setSearchQuery,
  openProjectDetail,
}) {
  // Simple filtering by project name for searchQuery
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Your Projects</h2>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search projects"
        className={styles.searchInput}
      />
      {filteredProjects.length === 0 ? (
        <p className={styles.emptyMessage}>No projects found.</p>
      ) : (
        <ul className={styles.projectList}>
          {filteredProjects.map((project) => (
            <li
              key={project.id}
              className={styles.project}
              onClick={() => openProjectDetail(project)}
            >
              <h3 className={styles.projectTitle}>{project.name}</h3>
              <p className={styles.projectText}>{project.description}</p>
              <div className={styles.techStack}>
                {project.techStack.map((tech, idx) => {
                  const color = techColors[tech] || "#999";
                  const docUrl = techDocs[tech] || "#";
                  return (
                    <Tippy
                      key={idx}
                      content={`Click to view ${tech} documentation`}
                      animation="scale"
                      delay={[100, 0]}
                      theme="dark"
                    >
                      <a
                        href={docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.techTag}
                        style={{ backgroundColor: color, color: "#000" }}
                        title={tech}
                        onClick={(e) => {
                          if (!docUrl) e.preventDefault();
                        }}
                      >
                        {tech}
                      </a>
                    </Tippy>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProjectList;
