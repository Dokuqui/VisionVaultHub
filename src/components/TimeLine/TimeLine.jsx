import { useState } from "react";
import ListView from "./ListView";
import VisualView from "./VisualView";
import styles from "./TimeLine.module.css";

function TimeLine({ timeline, setTimeline, isEditing }) {
  const [viewMode, setViewMode] = useState("list");

  const today = new Date().toISOString().slice(0, 10);
  const filteredSortedTimeline = timeline.sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const handleChange = (index, key, value, subIndex = null) => {
    setTimeline((prev) => {
      const updated = [...prev];
      if (subIndex !== null) {
        const milestone = { ...updated[index] };
        const subMilestones = milestone.subMilestones
          ? [...milestone.subMilestones]
          : [];
        subMilestones[subIndex] = { ...subMilestones[subIndex], [key]: value };
        milestone.subMilestones = subMilestones;
        updated[index] = milestone;
      } else {
        updated[index] = { ...updated[index], [key]: value };
      }
      return updated;
    });
  };

  const handleAdd = () => {
    setTimeline((prev) => [
      ...prev,
      { title: "", date: "", subMilestones: [] },
    ]);
  };

  const handleRemove = (index, subIndex = null) => {
    setTimeline((prev) => {
      const updated = [...prev];
      if (subIndex !== null) {
        const milestone = { ...updated[index] };
        const subMilestones = milestone.subMilestones
          ? [...milestone.subMilestones]
          : [];
        subMilestones.splice(subIndex, 1);
        milestone.subMilestones = subMilestones;
        updated[index] = milestone;
      } else {
        updated.splice(index, 1);
      }
      return updated;
    });
  };

  const handleAddSubMilestone = (index) => {
    setTimeline((prev) => {
      const updated = [...prev];
      const milestone = { ...updated[index] };
      const subMilestones = milestone.subMilestones
        ? [...milestone.subMilestones]
        : [];
      subMilestones.push({ title: "", date: "" });
      milestone.subMilestones = subMilestones;
      updated[index] = milestone;
      return updated;
    });
  };

  const minDate = filteredSortedTimeline[0]?.date || today;
  const daysBetween = (date1, date2) =>
    (new Date(date1) - new Date(date2)) / (1000 * 3600 * 24);

  return (
    <div className={styles.timelineContainer}>
      <h3 className={styles.timelineHeader}>Roadmap / Timeline</h3>

      <div className={styles.viewModeButtons}>
        <button
          type="button"
          onClick={() => setViewMode("list")}
          disabled={viewMode === "list"}
          className={styles.viewModeButton}
        >
          List View
        </button>
        <button
          type="button"
          onClick={() => setViewMode("visual")}
          disabled={viewMode === "visual"}
          className={styles.viewModeButton}
        >
          Visual View
        </button>
      </div>

      {viewMode === "list" && (
        <ListView
          timeline={filteredSortedTimeline}
          isEditing={isEditing}
          handleChange={handleChange}
          handleRemove={handleRemove}
          handleAdd={handleAdd}
          handleAddSubMilestone={handleAddSubMilestone}
        />
      )}

      {viewMode === "visual" && (
        <VisualView
          timeline={filteredSortedTimeline}
          minDate={minDate}
          daysBetween={daysBetween}
        />
      )}
    </div>
  );
}

export default TimeLine;
