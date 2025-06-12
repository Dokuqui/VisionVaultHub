import SubMilestoneItem from "./SubMilestoneItem";
import styles from "./TimeLine.module.css";

function MilestoneItem({
  item,
  index,
  isEditing,
  handleChange,
  handleRemove,
  handleAddSubMilestone,
}) {
  return (
    <li className={styles.timelineItem}>
      {isEditing ? (
        <>
          <div className={styles.timelineInputWrapper}>
            <span className={styles.dateWrapper}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={styles.dateIcon}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                width="18"
                height="18"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <input
                type="date"
                value={item.date}
                onChange={(e) => handleChange(index, "date", e.target.value)}
                className={styles.timelineDateInput}
                aria-label={`Milestone date for ${item.title || "milestone"}`}
              />
            </span>
            <input
              type="text"
              value={item.title}
              onChange={(e) => handleChange(index, "title", e.target.value)}
              placeholder="Milestone title"
              className={styles.timelineTitleInput}
              aria-label="Milestone title"
            />
          </div>
          <button
            onClick={() => handleRemove(index)}
            className={styles.deleteButton}
            data-tooltip="Delete milestone"
            aria-label="Delete milestone"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className={styles.deleteIcon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-1-2H10a1 1 0 00-1 1v1h6V6a1 1 0 00-1-1z"
              />
            </svg>
          </button>

          <div style={{ marginTop: "0.5rem", marginLeft: "2rem" }}>
            {(item.subMilestones || []).map((sub, subIndex) => (
              <SubMilestoneItem
                key={subIndex}
                sub={sub}
                index={index}
                subIndex={subIndex}
                handleChange={handleChange}
                handleRemove={handleRemove}
              />
            ))}
            <button
              type="button"
              onClick={() => handleAddSubMilestone(index)}
              style={{
                fontSize: "0.85rem",
                marginTop: "0.3rem",
                color: "#007bff",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              + Add Sub-milestone
            </button>
          </div>
        </>
      ) : (
        <div className={styles.timelineContent}>
          <span className={styles.timelineDate}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={styles.dateIcon}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              width="18"
              height="18"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {item.date}
          </span>
          <span className={styles.timelineTitle}>{item.title}</span>

          {(item.subMilestones || []).length > 0 && (
            <ul
              style={{
                marginTop: "0.5rem",
                paddingLeft: "1.5rem",
                listStyle: "disc",
              }}
            >
              {item.subMilestones.map((sub, i) => (
                <li key={i}>
                  <strong>{sub.date}</strong> - {sub.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}

export default MilestoneItem;
