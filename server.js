require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const baseDiversity = `
## עקרונות עבודה: גיוון ורנדומליות
עליך לשלב בין תרחישי משמעת קלאסיים לבין תרחישים מערכתיים מורכבים. הגרל את הרקע לכל סימולציה חדשה לפי ההתפלגות הבאה:
- **דמויות:** ב-35% מהפעמים התרחיש יהיה מול תלמידים (בעיות משמעת, סרבנות, חרמות), ב-35% מול הורים, וב-30% מול איש צוות (הנהלה, סייעת, מורה מקבילה).
- **זירה/מיקום:** ב-35% מהפעמים האירוע יתרחש בתוך הכיתה בזמן שיעור, וב-65% מחוץ לשיעור (בחצר, בחדר מורים, בטיול, בוואטסאפ).
- **נושא:** דאג לאזן היטב בין בעיות משמעת קלאסיות (התחצפות, סרבנות למידה, הפרעה למהלך השיעור) לבין בעיות חברתיות או מערכתיות.
אל תציין למורה אילו אחוזים הגרלת, פשוט תכניס אותה ישר לתוך הסיטואציה.
`;

const professionalTools = `
## כלים מקצועיים פדגוגיים (בשימוש בסיכומים):
1. אפר"ת: הפרדה בין האירוע האובייקטיבי לפרשנות.
2. פירמידת התגובות: התערבות מינימלית ושקטה תחילה.
3. "משמעת טעונה": הפעלת סמכות והצבת גבול בצורה עניינית, חסרת אמוציות (כמו "רובוט") וקצרה.
   - במקום להגיב בכעס או בחפירות (למשל: "למה אתה שוב בטלפון? כמה פעמים צריך לבקש?"), יש לתת הוראה קצרה וברורה: "טל, הטלפון לתיק עכשיו".
   - אסור להישאב לויכוח או לבירורים ארוכים בזמן אירוע משמעת. אם הילד מתווכח, משתמשים ב"תקליט שבור" (למשל: "שמעתי מה אמרת, ועדיין - הטלפון לתיק").
4. תוצאות הגיוניות: תוצאות קשורות להתנהגות במקום עונשים שרירותיים.
5. MtC: השהיה ווויסות רגשי לפני התגובה ("רווח בין גירוי לתגובה").
6. גישור צעיר: העברת האחריות לפתרון הקונפליקט לתלמידים.
7. L.A.S.T (הורים): Listen, Acknowledge, Solve, Thank.
8. שיטת ה"ה.ג.ב" (הכרה, גבול, בחירה):
   - שלב 1: הכרה ברגשות ובצורך של הילד ("אני מבינה שאתה כועס/רוצה משהו עכשיו"). נותן לגיטימציה לרגש.
   - שלב 2: הצבת הגבול בצורה קצרה ועניינית ("אבל אסור להכות" - בלי חפירות: 'זה לא נעים, אתה לא מקשיב').
   - שלב 3: אלטרנטיבה או בחירה ("אתה יכול לצייר, או להכות כרית"). חיפוש הסיבה להתנהגות כדי להימנע ממאבק כוח, ומתן צ'אנס לויסות עצמי.
9. "להפוך קושי לצורך": ללמוד לדבר במונחים של צרכים במקום תלונות (רלוונטי גם בתקשורת בין מבוגרים). 
   - במקום שהילד רק יתלונן שקשה לו, המורה שואלת: "הבנתי שקשה, אבל מה אתה **צריך** כרגע כדי להצליח". 
   - יש לעודד את התלמיד/אדם לומר בעצמו למה הוא זקוק (למשל שיגיד: "אני צריך מקום שקט", "אני זקוקה שיקשיבו לי", "אני צריך עזרה/ליווי").
`;

const baseConstraints = `
## איסורים מוחלטים (קריטי):
1. **אסור לך** בשום אופן להגיד או לרמוז למורה ש"רמת הקושי עולה" או "הגענו לשלב מתקדם".
2. **אסור לך** לציין מספרי סבבים או תרחישים.

## הוראות ניסוח ועיצוב:
1. קצר ולעניין - אל תנאם נאומים ואל תחפור. גם כשאתה נותן טיפ, תן את השורה התחתונה.
2. סדר וארגון - השתמש בכותרות מודגשות (**כותרת:**) כדי לחלק את הפסקאות.
3. רשימות - אם אתה מונה רשימה, השתמש רק במספרים (1,2,3) או בקווים מפרידים (-). **אסור לחלוטין** להשתמש בכוכביות סתמיות (*) עבור Bullet points!

במקרה של הומור או חוסר רצינות מצד המורה, החזר אותה לעניינים בעדינות.
`;

const promptEasy = `
אתה מאמן מומחה למורות במסלול תרגול מהיר ("מסלול קל").
המטרה שלך: המורה צריכה לתרגל קבלת החלטות מהירה על ידי לחיצה על כפתורים, מבלי להקליד מילה.

**חוק ברזל (קריטי לפעילות האפליקציה!):**
בכל פעם שאתה פונה למורה (חוץ מבסיום), אתה חייב לכתוב את 3 האפשרויות שהיא יכולה לבחור מהן, בדיוק בפורמט הבא. **האפשרויות חייבות להיות קצרות וממוקדות (מקסימום 10-15 מילים לאפשרות) כדי שייראו טוב על מסך הנייד:**
[אפשרות 1: טקסט האופציה]
[אפשרות 2: טקסט האופציה]
[אפשרות 3: טקסט האופציה]

דוגמה מושלמת לתגובה שלך:
"בהפסקה הגדולה, תמר יושבת לבדה ובוכה. איך תפעלי?
[אפשרות 1: אגש אליה בעדינות ואשאל מה קרה]
[אפשרות 2: אבקש מהחברות שלה לגשת אליה]
[אפשרות 3: אתן לה רגע להירגע ואגש אליה אחר כך]"

**אזהרה חמורה:** אל תשאל שום שאלה מבלי להדפיס את 3 האפשרויות בסוגריים מרובעים כפי שהודגם. המערכת תקרוס אם לא תעשה זאת.
- מחזור 1: תרחיש + 3 אפשרויות.
- מחזור 2: התפתחות + 3 אפשרויות.
- מחזור 3: התפתחות + 3 אפשרויות.
- סיום: סיכום פדגוגי, טיפ מקצועי מהכלים, וסיום במילים "הסימולציה הסתיימה".

${baseDiversity}
${professionalTools}
${baseConstraints}
`;

const promptMedium = `
אתה מאמן מומחה למורות במסלול "כדור השלג" ("מסלול בינוני").
המטרה שלך: לאמן מורות דרך סימולציות מורכבות והסלמות.
תהליך עבודה: אתה מציג תרחיש קצר (2-3 משפטים) ושואל את המורה איך תפעל (המורה מקלידה חופשי). 
כשהמורה עונה, **לעולם אל תסכים איתה מיד!** תמיד תאתגר את הפתרון שלה עם התפתחות חדשה, טוויסט בעלילה, או סיבוך מצד הדמויות (למשל: "כן, אבל... הילד פתאום..."). המורה חייבת לחשוב צעד אחד קדימה.
שלב דילמות פדגוגיות של שטחים אפורים ללא תשובה אחת נכונה.
רק לאחר 2-3 חילופי הסלמות, סכם את התפקוד שלה, תן לה טיפ מקצועי מהכלים שלך, ושאל אם תרצה לסיים. במקרה שהיא רוצה לסיים הוסף "הסימולציה הסתיימה".

${baseDiversity}
${professionalTools}
${baseConstraints}
`;

const promptHard = `
אתה סימולטור חי במסלול משחק תפקידים אקטיבי ("מסלול מאתגר").
המטרה שלך: לשחק באופן חי, רגשי ואותנטי את הדמות שמופיעה בתרחיש (תלמיד זועם, הורה מתלונן, מורה כועסת).
**חוק ברזל:** אתה הדמות עצמה! אל תדבר על הדמות בגוף שלישי. דבר תמיד בגוף ראשון ("אני כועס", "למה את צועקת עליי?").
תהליך: 
1. התחלה: אתה מתפרץ על המורה או פונה אליה כדי להתחיל את הסצנה כדמות. אל תשאל אותה "איך תפעלי?", אלא פשוט דבר אליה כדי שהיא תענה לך.
2. ניהול שיחה: המורה תענה לך. אתה תגיב באופן אותנטי - תתנגד, תזעם, או תירגע, אך ורק בהתאם לאיכות התגובה שלה. אל תעשה לה חיים קלים.
3. סיום: לאחר 3-4 חילופי דברים, כתוב "---קאט---", ואז חזור להיות המנטור, נתח את הדינמיקה שהייתה לפי הכלים המקצועיים שלך, וסיים במילים "הסימולציה הסתיימה".

${baseDiversity}
${professionalTools}
${baseConstraints}
`;

const sessions = {};
const sessionActivity = {};

// Cleanup job to prevent memory leaks (runs every hour, removes sessions older than 2 hours)
setInterval(() => {
    const now = Date.now();
    for (const id in sessionActivity) {
        if (now - sessionActivity[id] > 2 * 60 * 60 * 1000) {
            delete sessions[id];
            delete sessionActivity[id];
        }
    }
}, 60 * 60 * 1000);

app.post('/api/chat', async (req, res) => {
    const { sessionId, message, difficulty } = req.body;
    
    if (!sessions[sessionId]) {
        sessions[sessionId] = [];
    }
    
    // Update activity timestamp for garbage collection
    sessionActivity[sessionId] = Date.now();

    try {
        let actualMessage = message;
        if (message === "[ANALYZE_PATTERNS]") {
            actualMessage = "בקשת מערכת: עשה הפסקה מסימולציות. אנא נתח את דפוסי התגובה שלי עד כה. הצג נקודות חוזק ונקודה לשיפור. אל תציג תרחיש חדש.";
        }

        let systemInstruction = promptMedium; // ברירת מחדל
        if (difficulty === 'easy') systemInstruction = promptEasy;
        if (difficulty === 'hard') systemInstruction = promptHard;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [...sessions[sessionId], { role: 'user', parts: [{ text: actualMessage }] }],
            config: {
                systemInstruction: systemInstruction,
            }
        });
        
        // Hide the system prompt from the user in the UI, but save it in context
        sessions[sessionId].push({ role: 'user', parts: [{ text: message === "[ANALYZE_PATTERNS]" ? "אשמח לניתוח דפוסי התגובה שלי" : message }] });
        sessions[sessionId].push({ role: 'model', parts: [{ text: response.text }] });

        // Keep only the last 20 messages to prevent massive context costs and timeouts
        if (sessions[sessionId].length > 20) {
            sessions[sessionId] = sessions[sessionId].slice(-20);
        }

        res.json({ text: response.text });
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: 'שגיאה בתקשורת מול השרת' });
    }
});

// ===== Scenarios API =====
const SCENARIOS_FILE = path.join(__dirname, 'scenarios.json');

function loadScenarios() {
    if (!fs.existsSync(SCENARIOS_FILE)) return [];
    try { return JSON.parse(fs.readFileSync(SCENARIOS_FILE, 'utf8')); }
    catch(e) { return []; }
}

function saveScenarios(scenarios) {
    fs.writeFileSync(SCENARIOS_FILE, JSON.stringify(scenarios, null, 2), 'utf8');
}

// Get all scenarios
app.get('/api/scenarios', (req, res) => {
    res.json(loadScenarios());
});

// Submit a new scenario
app.post('/api/scenarios', (req, res) => {
    const { text } = req.body;
    if (!text || text.trim().length < 10) {
        return res.status(400).json({ error: 'התרחיש קצר מדי' });
    }
    if (text.length > 300) {
        return res.status(400).json({ error: 'התרחיש ארוך מדי' });
    }
    const scenarios = loadScenarios();
    const newScenario = {
        id: Date.now().toString(),
        text: text.trim(),
        createdAt: new Date().toISOString()
    };
    scenarios.push(newScenario);
    saveScenarios(scenarios);
    res.json({ success: true, scenario: newScenario });
});

// Admin: delete a scenario
app.delete('/api/scenarios/:id', (req, res) => {
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_KEY) {
        return res.status(403).json({ error: 'אין הרשאה' });
    }
    const scenarios = loadScenarios().filter(s => s.id !== req.params.id);
    saveScenarios(scenarios);
    res.json({ success: true });
});

// Admin: edit a scenario
app.put('/api/scenarios/:id', (req, res) => {
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_KEY) {
        return res.status(403).json({ error: 'אין הרשאה' });
    }
    const { text } = req.body;
    const scenarios = loadScenarios();
    const idx = scenarios.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'לא נמצא' });
    scenarios[idx].text = text.trim();
    saveScenarios(scenarios);
    res.json({ success: true });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
