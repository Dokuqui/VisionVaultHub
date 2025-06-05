import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

const projectsCollection = "projects";

export async function getProjects(db) {
  const q = query(collection(db, projectsCollection), orderBy("name", "asc"));
  const snapshot = await getDocs(q);
  const projects = [];
  snapshot.forEach((doc) => {
    projects.push({ id: doc.id, ...doc.data() });
  });
  return projects;
}

export async function addProjectToFirestore(db, project) {
  // project: { name, description, techStack: string[] }
  return addDoc(collection(db, projectsCollection), project);
}
