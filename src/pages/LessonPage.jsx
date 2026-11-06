import { Link, useParams } from 'react-router-dom';
import FractionsLesson from '../lessons/FractionsLesson';
import EquationsLesson from '../lessons/EquationsLesson';

export default function LessonPage() {
  const { lessonId } = useParams();
  if (lessonId === '2') return <EquationsLesson />;
  if (lessonId !== '1') {
    return (
      <div className="glass" style={{ padding: 32, textAlign: 'center', display: 'grid', gap: 16, justifyItems: 'center' }}>
        <h2>Lesson not found</h2>
        <Link to="/" className="btn btn-primary">Back to lessons</Link>
      </div>
    );
  }
  return <FractionsLesson />;
}
