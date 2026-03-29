import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase'; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, addDoc, deleteDoc, query, where, doc } from 'firebase/firestore';
import { BookOpen, LogOut, GraduationCap, CheckCircle, Trash2, User } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [myCourses, setMyCourses] = useState([]); // Stores { regId: '...', courseId: 1 }

  const courses = [
    { id: 1, name: 'Cybersecurity Fundamentals', code: 'IST-301', credits: 3 },
    { id: 2, name: 'Database Management', code: 'IST-205', credits: 4 },
    { id: 3, name: 'Ethical Hacking', code: 'FIC-400', credits: 3 },
    { id: 4, name: 'Digital Forensics', code: 'FIC-405', credits: 4 },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) fetchMyCourses(currentUser.uid);
    });
    return () => unsubscribe();
  }, []);

  const fetchMyCourses = async (uid) => {
    const q = query(collection(db, "registrations"), where("studentId", "==", uid));
    const querySnapshot = await getDocs(q);
    // We store the Doc ID so we can delete it later (drop course)
    const enrolled = querySnapshot.docs.map(d => ({ regId: d.id, courseId: d.data().courseId }));
    setMyCourses(enrolled);
  };

  const handleAuth = async (type) => {
    try {
      if (type === 'login') await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) { alert(error.message); }
  };

  const enroll = async (courseId) => {
    if (myCourses.some(c => c.courseId === courseId)) return alert("Already enrolled!");
    const docRef = await addDoc(collection(db, "registrations"), {
      studentId: user.uid,
      courseId: courseId,
      timestamp: new Date()
    });
    setMyCourses([...myCourses, { regId: docRef.id, courseId }]);
  };

  const dropCourse = async (regId) => {
    if (window.confirm("Are you sure you want to drop this course?")) {
      await deleteDoc(doc(db, "registrations", regId));
      setMyCourses(myCourses.filter(c => c.regId !== regId));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
          <div className="flex justify-center mb-6"><GraduationCap size={48} className="text-blue-600"/></div>
          <h2 className="text-2xl font-bold text-center mb-6">Student Portal</h2>
          <input type="email" placeholder="Email" className="w-full p-2 mb-4 border rounded" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" className="w-full p-2 mb-6 border rounded" onChange={(e) => setPassword(e.target.value)} />
          <div className="flex gap-4">
            <button onClick={() => handleAuth('login')} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Login</button>
            <button onClick={() => handleAuth('signup')} className="flex-1 border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50">Sign Up</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center px-8 border-b border-blue-100">
        <h1 className="text-xl font-bold flex items-center gap-2 text-blue-800"><BookOpen className="text-blue-600"/> DVN Academy</h1>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-gray-700 font-medium"><User size={20} /> {user.email}</div>
          <button onClick={() => signOut(auth)} className="text-red-500 hover:text-red-700 flex items-center gap-1 font-semibold"><LogOut size={18}/> Logout</button>
        </div>
      </nav>

      <main className="p-8 max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {/* Left Side: Course Catalog */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-semibold mb-6">Available Courses</h2>
          <div className="space-y-4">
            {courses.map(course => {
              const isEnrolled = myCourses.some(c => c.courseId === course.id);
              return (
                <div key={course.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center transition hover:border-blue-300">
                  <div>
                    <h3 className="font-bold text-lg">{course.name}</h3>
                    <p className="text-gray-500 text-sm">{course.code} • {course.credits} Credits</p>
                  </div>
                  <button 
                    onClick={() => enroll(course.id)}
                    disabled={isEnrolled}
                    className={`px-6 py-2 rounded-full font-bold transition ${isEnrolled ? 'bg-green-100 text-green-600 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'}`}
                  >
                    {isEnrolled ? 'Registered' : 'Enroll'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Student Profile / Schedule */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><CheckCircle className="text-green-500"/> My Schedule</h2>
          <div className="space-y-4">
            {myCourses.length === 0 ? (
              <p className="text-gray-400 italic">No courses selected yet.</p>
            ) : (
              myCourses.map(enrolled => {
                const courseData = courses.find(c => c.id === enrolled.courseId);
                return (
                  <div key={enrolled.regId} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                    <span className="font-medium text-gray-800">{courseData?.name}</span>
                    <button onClick={() => dropCourse(enrolled.regId)} className="text-red-400 hover:text-red-600 transition">
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
          {myCourses.length > 0 && (
            <div className="mt-6 pt-4 border-t text-sm text-gray-500">
              Total Credits: {myCourses.reduce((acc, curr) => acc + (courses.find(c => c.id === curr.courseId)?.credits || 0), 0)}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;