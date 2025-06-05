import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import ReactMarkdown from "react-markdown";
import styles from "./ProjectDetail.module.css";
import { db } from "../../firebase";

function ProjectDetail({ project, onClose, refreshProjects }) {
  const [name, setName] = useState(project?.name || "");
  const [description, setDescription] = useState(project.description || "");
  const [techStack, setTechStack] = useState(
    project.techStack.join(", ") || ""
  );
  const [notes, setNotes] = useState(project.notes || "");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    try {
      const projectRef = doc(db, "projects", project.id);
      await setDoc(
        projectRef,
        {
          name,
          description,
          techStack: techStack
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          notes,
        },
        { merge: true }
      );
      setSaving(false);
      setIsEditing(false);
      setHasChanges(true);
      refreshProjects();
    } catch (err) {
      setError("Failed to save project: " + err.message);
      setSaving(false);
    }
  };

  return (
    <div className={styles.pageBackdrop}>
      <div className={styles.container}>
        <header className={styles.header}>
          {isEditing ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.nameInput}
            />
          ) : (
            <h2 className={styles.projectTitle}>{project.name}</h2>
          )}
          <div className={styles.headerButtons}>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className={styles.editButton}
              >
                Edit
              </button>
            )}
            <button onClick={onClose} className={styles.closeButton}>
              Close
            </button>
          </div>
        </header>

        {error && <p className={styles.error}>{error}</p>}
        {hasChanges && <p className={styles.success}>Changes saved!</p>}

        <section className={styles.section}>
          <h3>Description</h3>
          {isEditing ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
            />
          ) : (
            <p className={styles.previewText}>{description}</p>
          )}
        </section>

        <section className={styles.section}>
          <h3>Tech Stack</h3>
          {isEditing ? (
            <input
              type="text"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              className={styles.textInput}
            />
          ) : (
            <div className={styles.techStack}>
              {project.techStack.map((tech, idx) => (
                <span key={idx} className={styles.techTag}>
                  {tech}
                </span>
              ))}
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h3>Notes</h3>
          {isEditing ? (
            <div className={styles.notesEditor}>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={styles.textarea}
              />
              <div className={styles.preview}>
                <ReactMarkdown>{notes}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className={styles.markdownPreview}>
              <ReactMarkdown>{notes}</ReactMarkdown>
            </div>
          )}
        </section>

        {isEditing && (
          <footer className={styles.footer}>
            <button
              onClick={handleSave}
              disabled={saving}
              className={styles.saveButton}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}

export default ProjectDetail;
