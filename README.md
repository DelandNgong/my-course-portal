# DVN Academy - Student Enrollment Portal

An automated, cloud-based course registration system built for the **IST 4035** class project.

## Features
- **Secure Authentication:** Email/Password login powered by Firebase.
- **Course Catalog:** Dynamic listing of semester units.
- **Real-time Registration:** Instant enrollment with Firestore synchronization.
- **Student Dashboard:** Personal profile showing unique Student ID and total credit load.
- **Responsive UI:** Fully mobile-friendly design using Tailwind CSS.

## Technical Architecture
- **Frontend:** React (Vite)
- **Styling:** Tailwind CSS (v4)
- **Database:** Google Cloud Firestore (NoSQL)
- **Auth:** Firebase Authentication
- **Hosting:** Vercel

## System Logic
1. **User Flow:** User registers -> Firebase Auth creates a unique `uid`.
2. **Data Model:** - `Courses`: Static array in the frontend (can be migrated to Firestore).
   - `Registrations`: Collection in Firestore linking `studentId` to `courseId`.
3. **Security:** Implemented RemoteSigned execution policies for environment setup and Firebase Test Mode for rapid prototyping.

## Installation & Setup
1. Clone the repo: `git clone https://github.com/DelandNgong/my-course-portal`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Build for production: `npm run build`
