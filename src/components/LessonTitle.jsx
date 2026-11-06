import '../lessons/fractions.css';

const letterColors = [
  'var(--fun-blue)',
  'var(--fun-purple)',
  'var(--fun-pink)',
  'var(--fun-orange)',
  'var(--fun-yellow)',
  'var(--fun-green)',
  'var(--fun-teal)',
  'var(--fun-blue)',
  'var(--fun-purple)',
];

export default function LessonTitle({ text }) {
  return (
    <h1 className="fractions-title" aria-label={text} key={text}>
      {text.split(' ').map((word, wordIndex, words) => (
        <span className="title-word" key={`${wordIndex}-${word}`}>
          {Array.from(word, (letter, index) => (
            <span
              key={index}
              aria-hidden="true"
              style={{ color: letterColors[(index + words.slice(0, wordIndex).join(' ').length) % letterColors.length], '--letter-delay': `${(index + words.slice(0, wordIndex).join(' ').length) * 65}ms` }}
            >
              {letter}
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}
