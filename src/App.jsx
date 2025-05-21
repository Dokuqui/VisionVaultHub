import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore';
import styles from './App.module.css';
import NotesEditor from './components/NotesEditor';
import { app } from './firebase';

function App() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({ name: '', description: '', techStack: '' });
  const [authMode, setAuthMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setError('');
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed:', currentUser ? currentUser.uid : null);
      setUser(currentUser);
      setError('');
    });
    return () => unsubscribe();
  }, [auth]);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (authMode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setProjects([]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value });
  };

  const addProject = async (e) => {
    e.preventDefault();
    if (!user || !user.uid || !newProject.name) {
      console.error('Cannot add project: user or project name missing', { user, name: newProject.name });
      setError('Please sign in and provide a project name');
      return;
    }
    try {
      console.log('Adding project for user:', user.uid);
      // Force token refresh and log claims
      const token = await user.getIdToken(true);
      console.log('Refreshed auth token:', token.substring(0, 20) + '...');
      const tokenResult = await user.getIdTokenResult(true);
      console.log('Token claims:', {
        aud: tokenResult.claims.aud,
        sub: tokenResult.claims.sub,
        email: tokenResult.claims.email,
        issuedAt: new Date(tokenResult.claims.iat * 1000).toISOString(),
        expiresAt: new Date(tokenResult.claims.exp * 1000).toISOString(),
      });
      // Add delay for token propagation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Proceeding with Firestore operation after delay');
      const techStackArray = newProject.techStack
        .split(',')
        .map((tech) => tech.trim())
        .filter((tech) => tech);
      // Try addDoc first
      console.log('Attempting addDoc...');
      const projectRef = await addDoc(collection(db, `users/${user.uid}/projects`), {
        name: newProject.name,
        description: newProject.description,
        techStack: techStackArray,
        notes: '',
      });
      console.log('Project added successfully with ID:', projectRef.id);
      setNewProject({ name: '', description: '', techStack: '' });
      setError('');
    } catch (err) {
      console.error('Error adding project with addDoc:', {
        code: err.code,
        message: err.message,
        details: err.details || 'No additional details',
        stack: err.stack,
      });
      // Fallback to setDoc
      try {
        console.log('Falling back to setDoc...');
        const projectId = `project-${Date.now()}`;
        await setDoc(doc(db, `users/${user.uid}/projects`, projectId), {
          name: newProject.name,
          description: newProject.description,
          techStack: techStackArray,
          notes: '',
        });
        console.log('Project added successfully with setDoc, ID:', projectId);
        setNewProject({ name: '', description: '', techStack: '' });
        setError('');
      } catch (setErr) {
        console.error('Error adding project with setDoc:', {
          code: setErr.code,
          message: setErr.message,
          details: setErr.details || 'No additional details',
          stack: setErr.stack,
        });
        setError(`Failed to add project: ${setErr.code || 'unknown'} - ${setErr.message}`);
      }
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetMessage('');
    setResetError('');
    if (!resetEmail) {
      setResetError('Please enter your email address.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage('Password reset email sent. Check your inbox.');
      setResetEmail('');
    } catch (err) {
      setResetError(err.message);
    }
  };

  const openResetModal = () => {
    setShowResetModal(true);
    setResetEmail('');
    setResetMessage('');
    setResetError('');
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetEmail('');
    setResetMessage('');
    setResetError('');
  };

  const openNotesEditor = (projectId) => {
    setSelectedProjectId(projectId);
  };

  const closeNotesEditor = () => {
    setSelectedProjectId(null);
  };

  const filteredProjects = projects.filter((project) => {
    const query = searchQuery.toLowerCase();
    return (
      project.name.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      project.techStack.some((tech) => tech.toLowerCase().includes(query))
    );
  });

  return (
    <div className={styles.app}>
      <h1 className={styles.title}>Project Ideas Notebook</h1>
      {user ? (
        <div className={styles.container}>
          <button onClick={handleSignOut} className={styles.signOutButton} title="Sign Out" aria-label="Sign out">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 17L21 12L16 7" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 12H9" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className={styles.content}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Add New Project</h2>
              <form onSubmit={addProject} className={styles.projectForm}>
                <input
                  type="text"
                  name="name"
                  value={newProject.name}
                  onChange={handleInputChange}
                  placeholder="Project Name"
                  className={styles.input}
                />
                <input
                  type="text"
                  name="description"
                  value={newProject.description}
                  onChange={handleInputChange}
                  placeholder="Description"
                  className={styles.input}
                />
                <input
                  type="text"
                  name="techStack"
                  value={newProject.techStack}
                  onChange={handleInputChange}
                  placeholder="Tech Stack (e.g., React, Python, Firebase)"
                  className={styles.input}
                />
                <button type="submit" className={styles.button}>Add Project</button>
              </form>
            </div>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Your Projects</h2>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className={styles.searchInput}
              />
              {filteredProjects.length === 0 ? (
                <p className={styles.emptyMessage}>
                  {searchQuery ? 'No projects match your search.' : 'No projects yet. Add one above!'}
                </p>
              ) : (
                <ul className={styles.projectList}>
                  {filteredProjects.map((project) => (
                    <li key={project.id} className={styles.project}>
                      <h3 className={styles.projectTitle}>{project.name}</h3>
                      <p className={styles.projectText}>{project.description}</p>
                      <div className={styles.techStack}>
                        {project.techStack.map((tech, index) => (
                          <span key={index} className={styles.techTag}>{tech}</span>
                        ))}
                      </div>
                      <button
                        onClick={() => openNotesEditor(project.id)}
                        className={styles.notesButton}
                        aria-label={`Edit notes for ${project.name}`}
                      >
                        Notes
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {selectedProjectId && (
            <NotesEditor
              projectId={selectedProjectId}
              userId={user.uid}
              onClose={closeNotesEditor}
            />
          )}
        </div>
      ) : (
        <div className={styles.authContainer}>
          <div className={styles.authCard}>
            <h2 className={styles.authTitle}>{authMode === 'signin' ? 'Sign In' : 'Sign Up'}</h2>
            {error && <p className={styles.error}>{error}</p>}
            <form onSubmit={handleEmailAuth} className={styles.authForm}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className={styles.input}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className={styles.input}
              />
              <button type="submit" className={styles.button}>
                {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            </form>
            <div className={styles.authFooter}>
              {authMode === 'signin' && (
                <button
                  onClick={openResetModal}
                  className={styles.forgotPasswordButton}
                  aria-label="Forgot password"
                >
                  Forgot Password?
                </button>
              )}
              <button onClick={handleGoogleSignIn} className={styles.googleButton} title="Sign in with Google" aria-label="Sign in with Google">
                <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z" fill="#4285F4" />
                  <path d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z" fill="#34A853" />
                  <path d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z" fill="#FBBC05" />
                  <path d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4056 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z" fill="#EA4335" />
                </svg>
              </button>
              <button
                onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                className={styles.toggleButton}
              >
                {authMode === 'signin' ? 'No account? Create one' : 'Have an account? Sign In'}
              </button>
            </div>
          </div>
          {showResetModal && (
            <div className={styles.modalBackdrop}>
              <div className={styles.modal}>
                <h3 className={styles.modalTitle}>Reset Password</h3>
                <form onSubmit={handleResetPassword} className={styles.resetForm}>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={styles.input}
                  />
                  {resetMessage && <p className={styles.successMessage}>{resetMessage}</p>}
                  {resetError && <p className={styles.error}>{resetError}</p>}
                  <div className={styles.modalActions}>
                    <button type="submit" className={styles.button}>Send Reset Email</button>
                    <button type="button" onClick={closeResetModal} className={styles.cancelButton}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;