import { useState } from "react";
import styles from "./ProjectForm.module.css";
import { addProjectToFirestore } from "../../firebase/projects";

function ProjectForm({ db, setError, refreshProjects }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    techStack: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Project name is required");
      return;
    }

    const techStackArray = form.techStack
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      await addProjectToFirestore(db, {
        name: form.name.trim(),
        description: form.description.trim(),
        techStack: techStackArray,
      });
      setForm({ name: "", description: "", techStack: "" });
      refreshProjects();
      setError("");
    } catch (err) {
      setError("Failed to add project.");
      console.error("Error adding project:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.projectForm}>
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Project Name"
        className={styles.input}
      />
      <input
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        className={styles.input}
      />
      <input
        name="techStack"
        value={form.techStack}
        onChange={handleChange}
        placeholder="Tech Stack (comma separated)"
        className={styles.input}
      />
      <button type="submit" className={styles.button}>
        Add Project
      </button>
    </form>
  );
}

export default ProjectForm;
