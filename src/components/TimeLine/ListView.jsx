import MilestoneItem from "./MilestoneItem";
import styles from "./TimeLine.module.css";

function ListView({
  timeline,
  isEditing,
  handleChange,
  handleRemove,
  handleAdd,
  handleAddSubMilestone,
}) {
  return (
    <>
      <ul className={styles.timelineItems}>
        {timeline.map((item, index) => (
          <MilestoneItem
            key={index}
            item={item}
            index={index}
            isEditing={isEditing}
            handleChange={handleChange}
            handleRemove={handleRemove}
            handleAddSubMilestone={handleAddSubMilestone}
          />
        ))}
      </ul>
      {isEditing && (
        <button className={styles.addButton} onClick={handleAdd} type="button">
          + Add Milestone
        </button>
      )}
    </>
  );
}

export default ListView;
