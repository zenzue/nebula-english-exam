export const EXAM_DURATION_SECONDS = 60 * 60;
export const DAILY_ATTEMPT_LIMIT = 3; // one initial attempt + two retakes per local day
export const EXAM_QUESTION_COUNT = 60; // 40 language questions + 4 complete 5-question passages
export const PASS_SCORE = 70;
export const EXAM_TIMEZONE = process.env.EXAM_TIMEZONE || 'Asia/Bangkok';
export function localDate(ts = Date.now()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: EXAM_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ts));
}
export function grade(pct) {
  if (pct >= 95) return { letter: 'S', name: 'EXCEPTIONAL', tone: 'stellar' };
  if (pct >= 85) return { letter: 'A', name: 'DISTINCTION', tone: 'stellar' };
  if (pct >= 75) return { letter: 'B', name: 'PROFICIENT', tone: 'good' };
  if (pct >= 70) return { letter: 'C', name: 'PASS', tone: 'good' };
  if (pct >= 60) return { letter: 'D', name: 'DEVELOPING', tone: 'warning' };
  return { letter: 'F', name: 'NEEDS PRACTICE', tone: 'warning' };
}
export const recommendations = {
  'Reading comprehension': [
    'Read one short English article each day; write a one-sentence summary of its main idea.',
    'Before choosing an answer, underline the sentence in the passage that supports it.',
    'Distinguish stated facts, plausible inferences, and claims not mentioned in the text.'
  ],
  'Vocabulary and grammar': [
    'Practise sentence patterns such as passive voice, verb tense, conditionals and relative clauses.',
    'Keep a vocabulary notebook with collocations and an original example sentence for every new word.',
    'Complete ten timed multiple-choice grammar exercises daily and review why the other options are incorrect.'
  ]
};
