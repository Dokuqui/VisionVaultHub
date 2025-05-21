import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import styles from "./NotesEditor.module.css";

function NotesEditor({ projectId, userId, onClose }) {
    const [notes, setNotes] = useState("");
    const [error, setError] = useState("");
    const db = getFirestore();

    if (!projectId || !userId) {
        console.error("Invalid projectId or userId:", { projectId, userId });
        setError("Invalid project or user ID");
        return <div className={styles.error}>Error: Invalid project or user ID</div>;
    }

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                console.log("Fetching notes for:", { projectId, userId });
                const projectRef = doc(db, `users/${userId}/projects/${projectId}`);
                const projectSnap = await getDoc(projectRef);
                if (projectSnap.exists()) {
                    console.log("Fetched notes:", projectSnap.data().notes);
                    setNotes(projectSnap.data().notes || "");
                } else {
                    console.error("Project document does not exist");
                    setError("Project document does not exist");
                }
            } catch (err) {
                console.error("Error fetching notes:", err);
                setError("Failed to load notes: " + err.message);
            }
        };
        fetchNotes();
    }, [db, projectId, userId]);

    const handleSaveNotes = async () => {
        try {
            console.log("Saving notes for:", { projectId, userId, notes });
            const projectRef = doc(db, `users/${userId}/projects/${projectId}`);
            await setDoc(projectRef, { notes }, { merge: true });
            console.log("Notes saved successfully");
            onClose();
        } catch (err) {
            console.error("Error saving notes:", err);
            setError("Failed to save notes: " + err.message);
        }
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modal}>
                <h3 className={styles.modalTitle}>Project Notes</h3>
                {error && (
                    <p className={styles.error} style={{ color: "red", fontWeight: "bold" }}>
                        {error}
                    </p>
                )}
                <div className={styles.editorContainer}>
                    <textarea
                        className={styles.textarea}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Write your notes in Markdown (e.g., # Heading, - List item)"
                    />
                    <div className={styles.preview}>
                        <ReactMarkdown>{notes}</ReactMarkdown>
                    </div>
                </div>
                <div className={styles.modalActions}>
                    <button
                        onClick={() => {
                            console.log("Save Notes clicked");
                            handleSaveNotes();
                        }}
                        className={styles.button}
                    >
                        Save Notes
                    </button>
                    <button onClick={onClose} className={styles.cancelButton}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default NotesEditor;