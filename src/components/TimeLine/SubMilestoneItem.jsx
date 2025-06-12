import styles from "./TimeLine.module.css";

function SubMilestoneItem({
  sub,
  index,
  subIndex,
  handleChange,
  handleRemove,
}) {
  return (
    <div
      className={styles.timelineInputWrapper}
      style={{ marginBottom: "0.3rem" }}
    >
      <span className={styles.dateWrapper}>
        <input
          type="date"
          value={sub.date}
          onChange={(e) =>
            handleChange(index, "date", e.target.value, subIndex)
          }
          className={styles.timelineDateInput}
          aria-label={`Sub-milestone date for ${sub.title || "sub milestone"}`}
        />
      </span>
      <input
        type="text"
        value={sub.title}
        onChange={(e) => handleChange(index, "title", e.target.value, subIndex)}
        placeholder="Sub-milestone title"
        className={styles.timelineTitleInput}
        aria-label="Sub-milestone title"
      />
      <button
        onClick={() => handleRemove(index, subIndex)}
        className={styles.deleteButton}
        data-tooltip="Delete sub milestone"
        aria-label="Delete sub milestone"
        type="button"
        style={{ marginLeft: "auto" }}
      >
        ✕
      </button>
    </div>
  );
}

export default SubMilestoneItem;
