import { Toaster, toast } from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase'; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, addDoc, deleteDoc, query, where, doc } from 'firebase/firestore';
import { BookOpen, LogOut, GraduationCap, CheckCircle, Trash2, User, LayoutDashboard, FileText, ShieldCheck } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' or 'profile'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [myCourses, setMyCourses] = useState([]);

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
    toast.success('Successfully Enrolled!');
    setMyCourses([...myCourses, { regId: docRef.id, courseId }]);
  };

  const dropCourse = async (regId) => {
    if (window.confirm("Are you sure you want to drop this course?")) {
      await deleteDoc(doc(db, "registrations", regId));
      setMyCourses(myCourses.filter(c => c.regId !== regId));
    }
    toast.error('Course Dropped');
  };

  // Login Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-t-4 border-blue-600">
          <div className="flex justify-center mb-4"><ShieldCheck size={50} className="text-blue-600"/></div>
          <h2 className="text-2xl font-bold text-center text-slate-800">DVN Academy Login</h2>
          <p className="text-center text-gray-500 mb-8 text-sm font-medium italic">Forensic IT & Cybercrime Division</p>
          <input type="email" placeholder="Student Email" className="w-full p-3 mb-4 border rounded-lg bg-gray-50" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" className="w-full p-3 mb-6 border rounded-lg bg-gray-50" onChange={(e) => setPassword(e.target.value)} />
          <div className="flex gap-4">
            <button onClick={() => handleAuth('login')} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">Login</button>
            <button onClick={() => handleAuth('signup')} className="flex-1 border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-bold hover:bg-blue-50 transition">Register</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-6 fixed h-full">
        <div className="flex items-center gap-2 mb-10">
          <GraduationCap className="text-blue-400" size={32} />
          <span className="text-xl font-bold tracking-tight text-white uppercase">DVN Portal</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('catalog')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${activeTab === 'catalog' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <LayoutDashboard size={20} /> Course Catalog
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <User size={20} /> Student Profile
          </button>
        </nav>

        <button onClick={() => signOut(auth)} className="mt-auto flex items-center gap-3 p-3 text-red-400 hover:bg-red-950/30 rounded-lg transition">
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-10">
        {activeTab === 'catalog' ? (
          <div>
            <header className="mb-10">
              <h2 className="text-3xl font-extrabold text-slate-800">Available Courses</h2>
              <p className="text-slate-500">Select your units for the Semester 1 term.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {courses.map(course => {
                const isEnrolled = myCourses.some(c => c.courseId === course.id);
                return (
                  <div key={course.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center group hover:shadow-md transition">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition">{course.name}</h3>
                      <p className="text-slate-500 font-mono text-sm">{course.code} • {course.credits} Credits</p>
                    </div>
                    <button 
                      onClick={() => enroll(course.id)}
                      disabled={isEnrolled}
                      className={`px-6 py-2 rounded-full font-bold transition ${isEnrolled ? 'bg-green-100 text-green-600' : 'bg-slate-900 text-white hover:bg-blue-600'}`}
                    >
                      {isEnrolled ? 'Registered' : 'Enroll Now'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl">
            <header className="mb-10">
              <h2 className="text-3xl font-extrabold text-slate-800">Student Record</h2>
              <p className="text-slate-500">Official academic registration summary.</p>
            </header>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
              <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                    <User size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{user.email}</h3>
                    <p className="text-blue-100 text-sm">Student ID: {user.uid.substring(0, 8).toUpperCase()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-widest opacity-70">Major</div>
                  <div className="font-bold">Information Systems Tech</div>
                </div>
              </div>

              <div className="p-8">
                <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
                  <FileText className="text-blue-500" size={18} /> Current Semester Schedule
                </h4>
                
                {myCourses.length === 0 ? (
                  <div className="bg-gray-50 border-2 border-dashed rounded-xl p-10 text-center text-gray-400">
                    You have not registered for any courses yet.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {myCourses.map(enrolled => {
                      const courseData = courses.find(c => c.id === enrolled.courseId);
                      return (
                        <div key={enrolled.regId} className="py-4 flex justify-between items-center hover:bg-gray-50 px-2 transition">
                          <div>
                            <span className="font-bold text-slate-700">{courseData?.code}</span>
                            <span className="mx-3 text-gray-300">|</span>
                            <span className="text-slate-600">{courseData?.name}</span>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{courseData?.credits} Cr</span>
                            <button onClick={() => dropCourse(enrolled.regId)} className="text-gray-400 hover:text-red-500 transition">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    <div className="pt-6 mt-4 flex justify-between items-center">
                       <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">Total Enrollment Load</span>
                       <span className="text-2xl font-black text-slate-800">
                         {myCourses.reduce((acc, curr) => acc + (courses.find(c => c.id === curr.courseId)?.credits || 0), 0)} Credits
                       </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Toaster position="top-center" />
    </div>
  );
}

export default App;