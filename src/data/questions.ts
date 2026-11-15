import type { HabitKey, Weekend } from '../types';

export interface Option {
  id: string;
  label: string;
}

export const AREAS: Option[] = [
  { id: 'tlv', label: 'תל אביב' },
  { id: 'ramatgan', label: 'רמת גן / גבעתיים' },
  { id: 'jlm', label: 'ירושלים' },
  { id: 'haifa', label: 'חיפה' },
  { id: 'beersheva', label: 'באר שבע' },
  { id: 'herzliya', label: 'הרצליה' },
  { id: 'rishon', label: 'ראשון לציון' },
  { id: 'petahtikva', label: 'פתח תקווה' },
];

export const HOBBIES: Option[] = [
  { id: 'gaming', label: '🎮 גיימינג' },
  { id: 'cooking', label: '🍳 בישול' },
  { id: 'sports', label: '🏃 ספורט' },
  { id: 'reading', label: '📚 קריאה' },
  { id: 'instrument', label: '🎸 נגינה' },
  { id: 'cocktails', label: '🍸 מיקסולוגיה' },
  { id: 'hiking', label: '🥾 טיולים' },
  { id: 'yoga', label: '🧘 יוגה' },
  { id: 'art', label: '🎨 אמנות' },
  { id: 'boardgames', label: '🎲 משחקי קופסה' },
  { id: 'photography', label: '📷 צילום' },
  { id: 'dancing', label: '💃 ריקוד' },
];

export const SHOWS: Option[] = [
  { id: 'drama', label: 'דרמה' },
  { id: 'comedy', label: 'קומדיה' },
  { id: 'reality', label: 'ריאליטי' },
  { id: 'scifi', label: 'מדע בדיוני ופנטזיה' },
  { id: 'crime', label: 'מתח ופשע' },
  { id: 'anime', label: 'אנימה' },
  { id: 'docu', label: 'דוקו' },
  { id: 'sporttv', label: 'ספורט בטלוויזיה' },
];

export const MUSIC: Option[] = [
  { id: 'indie', label: 'אינדי' },
  { id: 'pop', label: 'פופ' },
  { id: 'rock', label: 'רוק' },
  { id: 'mizrahi', label: 'מזרחית' },
  { id: 'hiphop', label: 'היפ הופ' },
  { id: 'electronic', label: 'אלקטרוני' },
  { id: 'classical', label: 'קלאסית' },
  { id: 'silence', label: 'שקט מוחלט' },
];

export const WEEKENDS: { id: Weekend; label: string }[] = [
  { id: 'trips', label: '🌄 טיול מוקדם בבוקר' },
  { id: 'parties', label: '🎉 יציאות עד השעות הקטנות' },
  { id: 'couch', label: '🛋️ פיג׳מה ונטפליקס' },
  { id: 'family', label: '🍲 ארוחות משפחה' },
  { id: 'mixed', label: '🔀 קצת מהכל' },
];

/**
 * Behavioral anchoring: each habit is asked as an everyday scenario.
 * Option i maps to scale value i + 1. `levels` are short labels used on cards.
 */
export interface ScaleQuestion<K extends string> {
  key: K;
  topic: string;
  question: string;
  options: string[];
  levels: string[];
}

export const HABIT_QUESTIONS: ScaleQuestion<HabitKey>[] = [
  {
    key: 'cleanliness',
    topic: 'ניקיון וסדר',
    question: 'חזרת הביתה ויש כמה כלים בכיור מהבוקר. מה קורה?',
    options: [
      'לא ממש שמתי לב',
      'אשטוף כשיצטברו',
      'אשטוף עד הערב',
      'שוטף/ת מיד אחרי שאכלתי',
      'כלים בכיור? זה לא קורה אצלי',
    ],
    levels: ['זורם', 'רגוע', 'ממוצע', 'מסודר', 'סטרילי'],
  },
  {
    key: 'sleep',
    topic: 'שעות שינה',
    question: 'השעה 00:30 בלילה. מה הכי סביר שאת/ה עושה?',
    options: ['ישן/ה כבר שעתיים', 'נכנס/ת למיטה', 'תלוי ביום', 'באמצע עוד פרק', 'היום רק מתחיל'],
    levels: ['ציפור בוקר', 'די מוקדם', 'באמצע', 'די מאוחר', 'ציפור לילה'],
  },
  {
    key: 'presence',
    topic: 'נוכחות בבית',
    question: 'יום שלישי רגיל. כמה שעות ערות את/ה בבית?',
    options: ['כמעט אף אחת', 'רק בערב', 'חצי יום', 'רוב היום', 'כל היום, עבודה מהבית'],
    levels: ['כמעט לא בבית', 'בעיקר בערבים', 'חצי-חצי', 'הרבה בבית', 'עבודה מהבית'],
  },
  {
    key: 'guests',
    topic: 'אירוח',
    question: 'כמה פעמים בשבוע מגיעים אליך חברים או בן/בת זוג?',
    options: ['כמעט אף פעם', 'פעם בשבועיים', 'פעם בשבוע', '2–3 פעמים', 'הבית תמיד מלא'],
    levels: ['מקלט שקט', 'אירוח נדיר', 'אירוח מדי פעם', 'אירוח תכוף', 'תחנת רכבת'],
  },
  {
    key: 'noise',
    topic: 'רעש בבית',
    question: 'איך נשמע החדר שלך בערב רגיל?',
    options: ['שקט מוחלט', 'שקט, עם אוזניות', 'טלוויזיה ברקע', 'מוזיקה ברמקול', 'רועש ושמח'],
    levels: ['שקט מוחלט', 'שקט', 'מתון', 'מוזיקה ברקע', 'רועש ושמח'],
  },
];

export const SOCIAL_QUESTION: ScaleQuestion<'socialBattery'> = {
  key: 'socialBattery',
  topic: 'אנרגיה חברתית',
  question: 'חזרת מיום ארוך והשותפים יושבים בסלון. מה את/ה עושה?',
  options: [
    'ישר לחדר לטעון מצברים',
    'שלום קצר ולחדר',
    'תלוי במצב הרוח',
    'יושב/ת איתם קצת',
    'מתיישב/ת ומספר/ת על כל היום',
  ],
  levels: ['טעינה לבד', 'בעיקר לבד', 'מאוזן', 'אוהב/ת חברה', 'חיית סלון'],
};

export function labelOf(list: Option[], id: string): string {
  return list.find((o) => o.id === id)?.label ?? id;
}
