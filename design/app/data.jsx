/* Quivo — sample data model */
const CATS = {
  reading:        { key: 'reading',        label: 'Reading',        v: '--cat-reading',        t: '--cat-reading-tint' },
  responsibility: { key: 'responsibility', label: 'Responsibility', v: '--cat-responsibility', t: '--cat-responsibility-tint' },
  learning:       { key: 'learning',       label: 'Learning',       v: '--cat-learning',       t: '--cat-learning-tint' },
  health:         { key: 'health',         label: 'Health',         v: '--cat-health',         t: '--cat-health-tint' },
  family:         { key: 'family',         label: 'Family',         v: '--cat-family',         t: '--cat-family-tint' },
};

const TASKS = [
  { id: 't1', title: 'Read for 20 minutes', cat: 'reading',        xp: 20, coins: 10, diff: 2, mins: 20, icon: 'book',     done: false, today: true },
  { id: 't2', title: 'Make your bed',       cat: 'responsibility', xp: 5,  coins: 2,  diff: 1, mins: 3,  icon: 'home',     done: true,  today: true },
  { id: 't3', title: 'Brush teeth',         cat: 'health',         xp: 5,  coins: 2,  diff: 1, mins: 3,  icon: 'sparkle',  done: true,  today: true },
  { id: 't4', title: 'Math homework',       cat: 'learning',       xp: 25, coins: 12, diff: 3, mins: 30, icon: 'pencilSquare', done: false, today: true },
  { id: 't5', title: 'Tidy your room',      cat: 'responsibility', xp: 15, coins: 8,  diff: 2, mins: 15, icon: 'home',     done: false, today: true },
  { id: 't6', title: 'Set the dinner table',cat: 'family',         xp: 10, coins: 5,  diff: 1, mins: 8,  icon: 'heart',    done: false, today: true },
  { id: 't7', title: 'Practice piano',      cat: 'learning',       xp: 20, coins: 10, diff: 2, mins: 20, icon: 'star',     done: false, today: false },
  { id: 't8', title: 'Walk the dog',        cat: 'health',         xp: 15, coins: 8,  diff: 2, mins: 15, icon: 'heart',    done: false, today: false },
  { id: 't9', title: 'Water the plants',    cat: 'family',         xp: 8,  coins: 4,  diff: 1, mins: 5,  icon: 'heart',    done: false, today: false },
  { id: 't10',title: 'Tie your shoes',      cat: 'responsibility', xp: 5,  coins: 2,  diff: 1, mins: 2,  icon: 'check',    done: false, today: false },
];

const REWARDS = [
  { id: 'r1', title: 'Ice cream trip',     cost: 60,  cat: 'family',   tone: 78,  note: 'A scoop of your choice' },
  { id: 'r2', title: '30 min gaming',      cost: 80,  cat: 'family',   tone: 295, note: 'Extra screen time' },
  { id: 'r3', title: 'New book',           cost: 150, cat: 'reading',  tone: 250, note: 'Pick any title under $15' },
  { id: 'r4', title: 'Movie night',        cost: 200, cat: 'family',   tone: 12,  note: 'You choose the film' },
  { id: 'r5', title: 'Tennis lesson',      cost: 320, cat: 'health',   tone: 160, note: 'One private session' },
  { id: 'r6', title: 'Toy budget $20',     cost: 450, cat: 'family',   tone: 45,  note: 'Spend it how you like' },
];

const ACHIEVEMENTS = [
  { id: 'a1', title: 'First Chapter',   desc: 'Finish your first book',      icon: 'book',   done: true,  tone: 250, tier: 'Bronze' },
  { id: 'a2', title: 'Early Riser',     desc: 'Make your bed 20 times',      icon: 'home',   done: true,  tone: 295, tier: 'Bronze' },
  { id: 'a3', title: 'Week Warrior',    desc: 'Keep a 7-day streak',         icon: 'flame',  done: true,  tone: 45,  tier: 'Silver' },
  { id: 'a4', title: 'Page Turner',     desc: 'Read 100 pages',              icon: 'pages',  done: true,  tone: 250, tier: 'Silver' },
  { id: 'a5', title: 'Task Master',     desc: 'Complete 30 tasks',           icon: 'check',  prog: 23, total: 30, tone: 155, tier: 'Silver' },
  { id: 'a6', title: 'Bookworm',        desc: 'Finish 10 books',             icon: 'book',   prog: 4,  total: 10, tone: 250, tier: 'Gold' },
  { id: 'a7', title: 'Month of Habits', desc: 'Keep a 30-day streak',        icon: 'flame',  prog: 12, total: 30, tone: 45,  tier: 'Gold' },
  { id: 'a8', title: 'Helping Hand',    desc: 'Help out 25 times',           icon: 'heart',  prog: 9,  total: 25, tone: 12,  tier: 'Gold' },
  { id: 'a9', title: 'Scholar',         desc: 'Complete 50 learning tasks',  icon: 'star',   prog: 0,  total: 50, tone: 65,  locked: true, tier: 'Platinum' },
];

const BOOKS = [
  { id: 'b1', title: 'The Wild Robot',          author: 'Peter Brown',     pages: 288, read: 288, status: 'done',    tone: 160 },
  { id: 'b2', title: 'Charlotte\u2019s Web',    author: 'E. B. White',     pages: 192, read: 192, status: 'done',    tone: 12 },
  { id: 'b3', title: 'The One and Only Ivan',   author: 'K. Applegate',    pages: 320, read: 142, status: 'reading', tone: 250 },
  { id: 'b4', title: 'Wonder',                  author: 'R. J. Palacio',   pages: 320, read: 36,  status: 'reading', tone: 295 },
];

const CHILD = {
  name: 'Mia',
  initial: 'M',
  level: 7,
  title: 'Habit Builder',
  xp: 1840,
  xpInLevel: 340,
  xpToLevel: 500,
  coins: 248,
  streak: 12,
  hue1: 282, hue2: 250,   // avatar gradient
  tasksToday: 6,
  tasksDone: 2,
};

const STATS = {
  totalXp: 1840,
  booksRead: 6,
  tasksCompleted: 142,
  streak: 12,
  pagesThisMonth: 412,
  booksThisYear: 6,
  readingStreak: 9,
  minutesThisWeek: 145,
};

// week activity (XP per day) for charts
const WEEK = [
  { d: 'M', xp: 45, done: true },
  { d: 'T', xp: 60, done: true },
  { d: 'W', xp: 30, done: true },
  { d: 'T', xp: 75, done: true },
  { d: 'F', xp: 55, done: true },
  { d: 'S', xp: 90, done: true },
  { d: 'S', xp: 35, done: false, today: true },
];

// parent approval queue
const APPROVALS = [
  { id: 'p1', child: 'Mia',  task: 'Read for 20 minutes', cat: 'reading', xp: 20, coins: 10, when: '10 min ago', note: 'Read 22 pages of Ivan' },
  { id: 'p2', child: 'Mia',  task: 'Math homework',       cat: 'learning', xp: 25, coins: 12, when: '1 hr ago',  note: 'Worksheet 14 complete' },
  { id: 'p3', child: 'Leo',  task: 'Walk the dog',        cat: 'health',   xp: 15, coins: 8,  when: '2 hr ago',  note: '' },
];

const REDEMPTIONS = [
  { id: 'd1', child: 'Mia', reward: 'Ice cream trip', cost: 60, when: 'Today' },
];

const KIDS = [
  { name: 'Mia', initial: 'M', level: 7, streak: 12, coins: 248, hue1: 282, hue2: 250, tasksDone: 2, tasksTotal: 6 },
  { name: 'Leo', initial: 'L', level: 4, streak: 5,  coins: 96,  hue1: 200, hue2: 160, tasksDone: 3, tasksTotal: 5 },
];

window.Q = { CATS, TASKS, REWARDS, ACHIEVEMENTS, BOOKS, CHILD, STATS, WEEK, APPROVALS, REDEMPTIONS, KIDS };
