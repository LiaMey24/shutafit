import { monthKey } from './moveIn';
import type { Gender, Profile, Weekend } from '../types';

/** Demo profiles' desired move-in, in months from now (0 = this month). */
const DEMO_MOVE_IN: Record<string, number> = {
  d1: 1, d2: 0, d3: 2, d4: 0, d5: 3, d6: 1, d7: 5, d8: 2, d9: 4, d10: 0,
  d11: 6, d12: 3, d13: 1, d14: 8, d15: 2, d16: 4, d17: 0, d18: 7, d19: 3, d20: 1,
};

/** Demo profiles' gender (f = female, m = male), for the gender filter. */
const DEMO_GENDER: Record<string, Gender> = {
  d1: 'f', d2: 'm', d3: 'f', d4: 'm', d5: 'f', d6: 'm', d7: 'f', d8: 'm', d9: 'f', d10: 'm',
  d11: 'f', d12: 'm', d13: 'f', d14: 'm', d15: 'f', d16: 'm', d17: 'f', d18: 'm', d19: 'f', d20: 'm',
};

/**
 * Compact demo-profile builder.
 * habits: 5 digits = cleanliness, sleep, presence, guests, noise (1–5).
 * flags: S smokes · s ok with smoker · P has pet · p ok with pet ·
 *        k keeps kosher · K kosher is a deal-breaker · b keeps Shabbat · B Shabbat is a deal-breaker
 */
function p(
  id: string,
  name: string,
  age: number,
  occupation: string,
  bio: string,
  habits: string,
  social: number,
  weekend: Weekend,
  hobbies: string[],
  shows: string[],
  music: string[],
  maxBudget: number,
  areas: string[],
  flags: string,
): Profile {
  const [cleanliness, sleep, presence, guests, noise] = habits.split('').map(Number);
  const has = (c: string) => flags.includes(c);
  return {
    id,
    name,
    age,
    gender: DEMO_GENDER[id],
    moveIn: monthKey(DEMO_MOVE_IN[id] ?? 0),
    occupation,
    bio,
    filters: {
      maxBudget,
      areas,
      smokes: has('S'),
      okWithSmoker: has('s'),
      hasPet: has('P'),
      okWithPet: has('p'),
      keepsKosher: has('k') || has('K'),
      kosherIsDealBreaker: has('K'),
      keepsShabbat: has('b') || has('B'),
      shabbatIsDealBreaker: has('B'),
    },
    habits: { cleanliness, sleep, presence, guests, noise },
    personality: { socialBattery: social, weekend, hobbies, shows, music },
  };
}

export const SEED_PROFILES: Profile[] = [
  p('d1', 'נועה', 23, 'סטודנטית לפסיכולוגיה', 'אוהבת בית נקי ושקט בערבים, אבל תמיד שמחה לבישול משותף בשישי.', '42322', 3, 'trips', ['yoga', 'cooking', 'reading'], ['drama', 'docu'], ['indie', 'pop'], 2800, ['tlv', 'ramatgan'], 'p'),
  p('d2', 'איתי', 26, 'מפתח תוכנה, עבודה היברידית', 'גיימר בנשמה (Uncharted forever), עובד מהבית פעמיים בשבוע ומכין קפה מעולה.', '34432', 3, 'couch', ['gaming', 'boardgames', 'cooking'], ['scifi', 'anime'], ['rock', 'electronic'], 3200, ['tlv', 'ramatgan', 'petahtikva'], 'sp'),
  p('d3', 'מאיה', 24, 'מעצבת גרפית', 'יש לי חתולה סקוטיש פולד בשם פיתה. מחפשת שותפים רגועים שאוהבים חיות.', '33521', 2, 'couch', ['art', 'photography', 'reading'], ['drama', 'comedy'], ['indie', 'classical'], 3000, ['tlv', 'jlm'], 'Pp'),
  p('d4', 'עומר', 27, 'ברמן ומיקסולוג', 'עובד בלילות, מכין קוקטיילים ביתיים בסופ״ש ותמיד שמח לארח.', '25244', 5, 'parties', ['cocktails', 'instrument', 'dancing'], ['comedy', 'reality'], ['hiphop', 'electronic'], 2700, ['tlv'], 'Ssp'),
  p('d5', 'שירה', 22, 'סטודנטית לסיעוד', 'קמה מוקדם למשמרות, אוהבת סדר וצריכה שקט בלילה.', '51211', 2, 'family', ['reading', 'yoga'], ['drama', 'reality'], ['pop', 'mizrahi'], 2400, ['jlm', 'beersheva'], 'kb'),
  p('d6', 'יונתן', 25, 'סטודנט להנדסה', 'ספורט בבוקר, לימודים בערב. בית מסודר זה חשוב לי.', '42222', 3, 'trips', ['sports', 'hiking', 'gaming'], ['sporttv', 'crime'], ['rock', 'pop'], 2600, ['haifa', 'tlv'], 'p'),
  p('d7', 'דניאל', 28, 'עורכת דין', 'עובדת הרבה, בבית בעיקר בערבים. אוהבת יין טוב וסדרות מתח.', '41212', 3, 'mixed', ['cooking', 'reading', 'hiking'], ['crime', 'drama'], ['indie', 'classical'], 3800, ['tlv', 'herzliya'], 'p'),
  p('d8', 'אורי', 24, 'מוזיקאי', 'מנגן גיטרה (בשעות סבירות, מבטיח). מחפש שותפים עם וייב טוב.', '25434', 4, 'parties', ['instrument', 'dancing', 'cocktails'], ['comedy', 'docu'], ['rock', 'indie'], 2500, ['tlv', 'ramatgan'], 'sp'),
  p('d9', 'הדר', 26, 'מורה ליוגה', 'רגועה, צמחונית, אוהבת בית מלא צמחים ושקט.', '42311', 2, 'trips', ['yoga', 'hiking', 'cooking'], ['docu', 'drama'], ['indie', 'silence'], 2900, ['tlv', 'herzliya', 'rishon'], 'p'),
  p('d10', 'רועי', 29, 'מנהל מוצר', 'עבודה מהבית רוב השבוע. בערב משחקי קופסה עם חברים.', '34543', 4, 'mixed', ['boardgames', 'gaming', 'cocktails'], ['scifi', 'comedy'], ['electronic', 'pop'], 3500, ['ramatgan', 'tlv', 'petahtikva'], 'p'),
  p('d11', 'תמר', 23, 'סטודנטית לקולנוע', 'בינג׳ זה אורח חיים. מבשלת פסטה ב-2 בלילה.', '25423', 4, 'couch', ['photography', 'art', 'cooking'], ['drama', 'anime', 'comedy'], ['indie', 'hiphop'], 2600, ['tlv', 'jlm'], 'sp'),
  p('d12', 'אליה', 25, 'סטודנט לרפואה', 'שומר כשרות ושבת, לומד הרבה ומחפש בית שקט ומכבד.', '42311', 2, 'family', ['reading', 'sports'], ['docu'], ['classical', 'silence'], 2400, ['jlm'], 'KB'),
  p('d13', 'גל', 27, 'שפית', 'המטבח הוא הממלכה שלי, ותמיד יש משהו טעים במקרר לשותפים.', '43233', 4, 'mixed', ['cooking', 'cocktails', 'hiking'], ['reality', 'comedy'], ['pop', 'mizrahi'], 3000, ['tlv', 'rishon'], 'Pp'),
  p('d14', 'נדב', 24, 'סטודנט למדעי המחשב', 'שקט, עובד על פרויקטים בלילה ואוהב אנימה.', '24521', 1, 'couch', ['gaming', 'reading'], ['anime', 'scifi'], ['electronic', 'silence'], 2500, ['ramatgan', 'tlv', 'haifa'], 'p'),
  p('d15', 'ליה', 22, 'סטודנטית לתקשורת', 'אנרגטית, אוהבת לארח ולצאת. הבית שלי תמיד שמח.', '35255', 5, 'parties', ['dancing', 'photography', 'sports'], ['reality', 'comedy'], ['pop', 'hiphop'], 2700, ['tlv', 'ramatgan'], 'sp'),
  p('d16', 'אביב', 30, 'אדריכל', 'אוהב עיצוב, סדר וקפה טוב. כלב גולדן מתוק בשם באדי.', '43322', 3, 'trips', ['art', 'hiking', 'photography'], ['docu', 'drama'], ['indie', 'rock'], 3600, ['tlv', 'herzliya'], 'Pp'),
  p('d17', 'רותם', 26, 'אחות בבית חולים', 'משמרות משתנות, צריכה שקט כשאני ישנה ביום. מבשלת המון.', '43211', 3, 'family', ['cooking', 'yoga', 'reading'], ['drama', 'reality'], ['mizrahi', 'pop'], 2800, ['rishon', 'tlv', 'petahtikva'], 'kp'),
  p('d18', 'עידו', 23, 'סטודנט לכלכלה', 'כדורסל, פלייסטיישן ושיחות עמוקות על הספה.', '34333', 4, 'mixed', ['sports', 'gaming', 'boardgames'], ['sporttv', 'comedy', 'crime'], ['hiphop', 'mizrahi'], 2600, ['ramatgan', 'tlv', 'beersheva'], 'p'),
  p('d19', 'יעל', 28, 'חוקרת במעבדה', 'מסודרת, מופנמת, אוהבת ספרים ומשחקי קופסה שקטים.', '52211', 1, 'couch', ['reading', 'boardgames', 'art'], ['crime', 'scifi'], ['classical', 'indie'], 3100, ['tlv', 'ramatgan', 'herzliya'], ''),
  p('d20', 'שחר', 25, 'פרילנסר בשיווק', 'עובד מהבית, אוהב טיולים בבוקר ואירוח קטן בערב.', '33533', 3, 'trips', ['hiking', 'cooking', 'photography'], ['comedy', 'docu'], ['indie', 'pop'], 3000, ['tlv', 'ramatgan', 'rishon'], 'sp'),
];

/** Canned replies the demo users send back in chat. */
export const DEMO_REPLIES = [
  'היי! כיף שהתאמנו 😊',
  'נשמע מעולה, מתי נוח לך לדבר?',
  'אני בעד להיפגש לקפה ולהכיר',
  'איזה אזור הכי מתאים לך בסוף?',
];
