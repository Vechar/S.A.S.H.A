import { Route, Routes, useMatch } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import LessonPage from './pages/LessonPage';
import Practice from './pages/Practice';
import QuickMath from './pages/QuickMath';

export default function App() {
  const isLesson = useMatch('/lesson/:lessonId');

  return (
    <>
      <Navbar />
      <main className={`main-content${isLesson ? ' main-content-lesson' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lesson/:lessonId" element={<LessonPage />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/practice/quick-math" element={<QuickMath key="arithmetic" />} />
          <Route path="/practice/equations" element={<QuickMath key="equations" equations />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </>
  );
}
