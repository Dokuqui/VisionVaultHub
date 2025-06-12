import { useEffect, useState } from "react";
import {
  collection,
  query,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";
import styles from "./TaskList.module.css";

import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

function SortableTaskItem({
  task,
  isEditing,
  toggleDone,
  updateTaskField,
  deleteTask,
  editingDeadlines,
  setEditingDeadlines,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    opacity: isDragging ? 0.7 : 1,
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`${styles.taskListItem} ${task.done ? styles.taskDone : ""}`}
    >
      <span
        {...attributes}
        {...listeners}
        className={styles.dragHandle}
        aria-label="Drag to reorder"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M4 10h16v2H4v-2zm0 5h16v2H4v-2z" />
        </svg>
      </span>
      <input
        type="checkbox"
        className={styles.taskCheckbox}
        checked={task.done}
        onChange={() => toggleDone(task)}
        disabled={isEditing}
        aria-label={`Mark task ${task.title} as done`}
      />

      {isEditing ? (
        <input
          className={styles.taskTitleInput}
          type="text"
          value={task.title}
          onChange={(e) => updateTaskField(task.id, "title", e.target.value)}
          aria-label="Edit task title"
        />
      ) : (
        <span
          className={`${styles.taskTitle} ${task.done ? styles.taskDone : ""}`}
        >
          {task.title}
        </span>
      )}

      {isEditing ? (
        <select
          className={styles.taskSelect}
          value={task.priority}
          onChange={(e) => updateTaskField(task.id, "priority", e.target.value)}
          aria-label="Set task priority"
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      ) : (
        <span
          className={`${styles.taskPriorityTag} ${
            task.priority === "Low"
              ? styles.priorityLow
              : task.priority === "Medium"
                ? styles.priorityMedium
                : styles.priorityHigh
          }`}
          aria-label={`Priority: ${task.priority}`}
        >
          {task.priority}
        </span>
      )}

      {isEditing ? (
        <input
          className={styles.taskDate}
          type="date"
          value={
            editingDeadlines[task.id] !== undefined
              ? editingDeadlines[task.id]
              : task.deadline
                ? task.deadline.slice(0, 10)
                : ""
          }
          onChange={(e) => {
            const val = e.target.value;
            setEditingDeadlines((prev) => ({ ...prev, [task.id]: val }));
          }}
          onBlur={async (e) => {
            const val = e.target.value;
            await updateTaskField(task.id, "deadline", val);
            setEditingDeadlines((prev) => {
              const newState = { ...prev };
              delete newState[task.id];
              return newState;
            });
          }}
          aria-label="Set task deadline"
        />
      ) : (
        task.deadline && (
          <span
            className={styles.taskDate}
            title="Deadline"
            aria-label={`Deadline: ${task.deadline.slice(0, 10)}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={styles.dateIcon}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              width="18"
              height="18"
              aria-hidden="true"
              focusable="false"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>

            {" " + task.deadline.slice(0, 10)}
          </span>
        )
      )}

      <button
        className={styles.taskButton}
        onClick={() => deleteTask(task.id)}
        data-tooltip="Delete task"
        aria-label="Delete task"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-1-2H10a1 1 0 00-1 1v1h6V6a1 1 0 00-1-1z"
          />
        </svg>
      </button>
    </li>
  );
}

function TaskList({ projectId, isEditing }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editingDeadlines, setEditingDeadlines] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "projects", projectId, "tasks"),
      orderBy("order")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(fetched);
    });

    return () => unsubscribe();
  }, [projectId]);

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    await addDoc(collection(db, "projects", projectId, "tasks"), {
      title: newTask,
      done: false,
      priority: "Medium",
      deadline: null,
      order: tasks.length,
      createdAt: new Date(),
    });
    setNewTask("");
  };

  const updateTaskField = async (taskId, field, value) => {
    await updateDoc(doc(db, "projects", projectId, "tasks", taskId), {
      [field]: value,
    });
  };

  const toggleDone = async (task) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "projects", projectId, "tasks", task.id), {
        done: !task.done,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteTask = async (taskId) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await deleteDoc(doc(db, "projects", projectId, "tasks", taskId));
    } finally {
      setIsUpdating(false);
    }
  };

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 8,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 200,
      tolerance: 5,
    },
  });

  const keyboardSensor = useSensor(KeyboardSensor);

  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);

    const newTasks = arrayMove(tasks, oldIndex, newIndex);

    await Promise.all(
      newTasks.map((task, i) => updateTaskField(task.id, "order", i))
    );
  };

  return (
    <div className={styles.taskListContainer}>
      <h3 className={styles.taskListHeader}>Tasks / To-Do List</h3>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className={styles.taskListItems}>
            {tasks.map((task) => (
              <SortableTaskItem
                key={task.id}
                task={task}
                isEditing={isEditing}
                toggleDone={toggleDone}
                updateTaskField={updateTaskField}
                deleteTask={deleteTask}
                editingDeadlines={editingDeadlines}
                setEditingDeadlines={setEditingDeadlines}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {isEditing && (
        <div className={styles.taskInputWrapper}>
          <input
            type="text"
            className={styles.taskInputField}
            value={newTask}
            placeholder="New task"
            onChange={(e) => setNewTask(e.target.value)}
            aria-label="New task title"
          />
          <button
            className={styles.taskAddButton}
            onClick={handleAddTask}
            type="button"
            aria-label="Add new task"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}

export default TaskList;
