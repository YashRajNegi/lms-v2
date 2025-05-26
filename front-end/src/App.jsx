import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { useUser, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import Home from './Pages/Home'
import Course from './Pages/Course'
import Educator from './Pages/Educator'
import About from './Pages/About'
import Contact from './Pages/Contact'
import Navbar from './Components/Navbar'
import Footer from './Components/Footer'
import { useContext } from 'react'
import { AppContext } from './context/AppContext'
import Dashboard from './Pages/Dashboard'
import CourseDetail from './Pages/CourseDetail'
import DiscussionList from './Pages/DiscussionList'
import DiscussionDetail from './Pages/DiscussionDetail'
import DiscussionForm from './Pages/DiscussionForm'
import AllCourses from './Pages/AllCourses'
import CreateCourse from './Pages/CreateCourse'

const App = () => {
  const { isLoaded, isSignedIn } = useUser();
  const { loading } = useContext(AppContext);

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
      <Routes>
          <Route 
            path="/" 
            element={
              <>
                <SignedIn>
                  <Dashboard />
                </SignedIn>
                <SignedOut>
                  <Home />
                </SignedOut>
              </>
            } 
          />
          <Route path="/courses" element={<AllCourses />} />
          <Route path="/course/:courseId" element={<CourseDetail />} />
          <Route path="/course/:courseId/discussions" element={<DiscussionList />} />
          <Route path="/course/:courseId/discussion/new" element={<DiscussionForm />} />
          <Route path="/course/:courseId/discussion/:threadId" element={<DiscussionDetail />} />
          <Route path="/course/:courseId/discussion/:threadId/edit" element={<DiscussionForm />} />
          <Route path="/create-course" element={<CreateCourse />} />
          <Route 
            path='/course' 
            element={
              <>
                <SignedIn>
                  <Course />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            } 
          />
          <Route 
            path='/educator' 
            element={
              <>
                <SignedIn>
                  <Educator />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            } 
          />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
      </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
