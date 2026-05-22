import type { ChatContext, IntentResult, PageContext } from './types';

// ═══════════════════════════════════════════════════════════════
// Keyword Databases
// ═══════════════════════════════════════════════════════════════

const WORKOUT_KEYWORDS: Record<string, string[]> = {
  // Exercise types
  exercise: ['exercise', 'exercises'],
  workout: ['workout', 'workouts', 'work-out', 'work-outs'],
  routine: ['routine', 'routines'],
  split: ['split', 'splits'],
  training: ['training', 'train'],
  hypertrophy: ['hypertrophy', 'hypertrophic'],
  strength: ['strength', 'stronger', 'strengthen'],
  endurance: ['endurance', 'endure'],
  cardio: ['cardio', 'cardiovascular', 'aerobic'],
  hiit: ['hiit', 'high intensity interval'],
  superset: ['superset', 'supersets', 'super-set'],
  dropset: ['dropset', 'dropsets', 'drop-set', 'drop-sets', 'drop set'],
  pyramid: ['pyramid', 'pyramiding'],
  amrap: ['amrap', 'as many reps'],
  emom: ['emom', 'every minute'],
  tabata: ['tabata'],
  compound: ['compound', 'compounds', 'multi-joint'],
  isolation: ['isolation', 'isolation', 'single-joint'],
  functional: ['functional', 'functionality'],
  mobility: ['mobility'],
  flexibility: ['flexibility', 'flexible'],

  // Sets / Reps / Metrics
  rep: ['rep', 'reps', 'repetition', 'repetitions'],
  set: ['set', 'sets'],
  weight: ['weight', 'weights', 'weighted', 'kg', 'lbs', 'pound', 'kilogram'],
  volume: ['volume', 'volumes'],
  intensity: ['intensity', 'intense'],
  frequency: ['frequency'],
  tempo: ['tempo'],
  pr: ['pr', 'personal record'],
  onerm: ['1rm', 'one rep max', 'one-rep max', 'onerepmax'],
  rpe: ['rpe', 'rate of perceived exertion'],
  rir: ['rir', 'reps in reserve'],
  mev: ['mev', 'minimum effective volume'],
  mrv: ['mrv', 'maximum recoverable volume'],

  // Programming concepts
  progressive_overload: ['progressive overload', 'progressive overloads'],
  deload: ['deload', 'deloads', 'deloading'],
  periodization: ['periodization', 'periodized', 'periodise', 'periodize'],
  warmup: ['warm-up', 'warmup', 'warm up', 'pre-workout warmup'],
  cooldown: ['cool-down', 'cooldown', 'cool down'],
  form: ['form', 'technique', 'techniques'],
  prehab: ['prehab', 'pre-hab'],
  rehab: ['rehab', 're-hab', 'rehabilitation'],
  injury_prevention: ['injury prevention', 'prevent injury'],
  corrective: ['corrective', 'correction'],
  activation: ['activation', 'activating'],
  myofascial: ['myofascial'],

  // Body regions
  push: ['push day', 'push workout', 'push-pull'],
  pull: ['pull day', 'pull workout'],
  legs: ['leg day', 'legs day', 'leg workout'],
  upper: ['upper body', 'upper-body'],
  lower: ['lower body', 'lower-body'],
  fullbody: ['full body', 'full-body', 'total body'],
  core: ['core', 'abs', 'abdominal', 'abdominals', 'midsection'],

  // Specific muscles
  glute: ['glute', 'glutes', 'gluteal', 'glute bridge', 'hip thrust'],
  quad: ['quad', 'quads', 'quadriceps', 'quadricep'],
  hamstring: ['hamstring', 'hamstrings'],
  calf: ['calf', 'calves'],
  bicep: ['bicep', 'biceps', 'bi', 'bicepts'],
  tricep: ['tricep', 'triceps', 'tri'],
  deltoid: ['delt', 'delts', 'deltoid', 'shoulder', 'shoulders'],
  reardelt: ['rear delt', 'rear delts', 'rear deltoid', 'posterior delt'],
  lat: ['lat', 'lats', 'latissimus', 'latissimus dorsi'],
  pec: ['pec', 'pecs', 'pectoral', 'chest'],
  trap: ['trap', 'traps', 'trapezius'],
  oblique: ['oblique', 'obliques'],
  serratus: ['serratus'],
  rotator_cuff: ['rotator cuff', 'rotator cuffs'],
  adductor: ['adductor', 'adductors', 'adduction'],
  abductor: ['abductor', 'abductors', 'abduction'],
  forearm: ['forearm', 'forearms'],
  grip: ['grip', 'grip strength', 'gripping'],

  // Exercises
  squat: ['squat', 'squats', 'squatting', 'back squat', 'front squat'],
  deadlift: ['deadlift', 'deadlifts', 'deadlifting', 'sumo deadlift', 'romanian deadlift', 'rdl', 'conventional deadlift'],
  bench: ['bench', 'bench press', 'benching', 'db bench', 'bb bench', 'incline bench', 'decline bench'],
  lunge: ['lunge', 'lunges', 'lunge variation'],
  plank: ['plank', 'planks', 'planking'],
  pullup: ['pull-up', 'pullup', 'pull-ups', 'pullups', 'chin-up', 'chin-ups'],
  pushup: ['push-up', 'pushup', 'push-ups', 'pushups'],
  row: ['row', 'rows', 'rowing', 'bent-over row', 'cable row', 'db row'],
  curl: ['curl', 'curls', 'curling', 'hammer curl', 'preacher curl'],
  extension: ['extension', 'extensions', 'leg extension', 'tricep extension'],
  press: ['press', 'pressing', 'overhead press', 'military press', 'ohp', 'shoulder press', 'chest press'],
  flye: ['fly', 'flys', 'flyes', 'cable fly', 'db fly', 'pec fly'],
  raise: ['raise', 'raises', 'lateral raise', 'front raise'],
  lateral: ['lateral', 'laterals'],
  front: ['front raise'],

  // Equipment
  gym: ['gym', 'gyms', 'fitness center'],
  lift: ['lift', 'lifting', 'lifter', 'weightlifting', 'weight-lifting'],
  dumbbell: ['dumbbell', 'dumbbells', 'db', 'dbs', 'free weight'],
  barbell: ['barbell', 'barbells', 'bb', 'bbs'],
  kettlebell: ['kettlebell', 'kettlebells', 'kb'],
  cable: ['cable', 'cables', 'cable machine', 'pulley'],
  machine: ['machine', 'machines', 'smith machine', 'cable machine', 'selectorized'],
  bodyweight: ['bodyweight', 'body-weight', 'calisthenics', 'bw'],

  // Stretching / Recovery
  foamroll: ['foam roll', 'foam rolling', 'foamroller'],
  stretch: ['stretch', 'stretching', 'stretches', 'flexibility work'],
  dynamic: ['dynamic', 'dynamics', 'dynamic stretching'],
  static: ['static', 'static stretching', 'static stretch'],
  pnf: ['pnf', 'proprioceptive neuromuscular facilitation'],

  // Programming / Builder
  exercise_selection: ['exercise selection', 'choose exercise'],
  program_design: ['program design', 'programdesign', 'design program', 'build program'],
  workout_builder: ['workout builder', 'build workout', 'create workout', 'program builder', 'session builder'],
  session_log: ['session log', 'log session', 'workout log', 'training log', 'log workout'],
};

const NUTRITION_KEYWORDS: Record<string, string[]> = {
  calorie: ['calorie', 'calories', 'kcal', 'caloric'],
  macro: ['macro', 'macros', 'macronutrient', 'macronutrients'],
  protein: ['protein', 'proteins', 'proteinate', 'whey', 'casein', 'amino acid', 'eaa', 'bcaa'],
  carb: ['carb', 'carbs', 'carbohydrate', 'carbohydrates'],
  fat: ['fat', 'fats', 'dietary fat', 'lipid', 'lipids'],
  diet: ['diet', 'diets', 'dieting', 'dietary'],
  nutrition: ['nutrition', 'nutritional', 'nutrient', 'nutrients'],
  meal: ['meal', 'meals', 'eat', 'eating', 'food', 'foods', 'cook', 'cooking', 'recipe', 'recipes'],
  tdee: ['tdee', 'total daily energy expenditure'],
  bmr: ['bmr', 'basal metabolic rate'],
  bmi: ['bmi', 'body mass index'],
  bodyfat: ['body fat', 'bodyfat', 'body-fat', 'bf%'],
  deficit: ['deficit', 'caloric deficit', 'energy deficit'],
  surplus: ['surplus', 'caloric surplus', 'energy surplus', 'surpluses'],
  maintenance: ['maintenance', 'maintenance calories'],
  cutting: ['cutting', 'cut', 'shred', 'shredding', 'lean out', 'lean down'],
  bulking: ['bulking', 'bulk', 'bulky', 'mass gain', 'massing'],
  recomp: ['recomp', 'recomposition', 'body recomposition', 'body recomp'],

  // Diet styles
  intermittentfasting: ['intermittent fasting', 'if', 'fasting', 'time-restricted', 'omad', '16:8', 'eat stop eat'],
  keto: ['keto', 'ketogenic', 'ketosis', 'ketones'],
  paleo: ['paleo', 'paleolithic', 'caveman diet'],
  vegan: ['vegan', 'veganism', 'plant-based', 'plant based'],
  vegetarian: ['vegetarian', 'vegetarianism', 'lacto-ovo'],
  mediterranean: ['mediterranean', 'mediterranean diet'],
  dash: ['dash diet'],
  glutenfree: ['gluten-free', 'gluten free', 'gf', 'celiac'],
  dairyfree: ['dairy-free', 'dairy free', 'lactose-free', 'lactose intolerant'],

  // Meal management
  mealprep: ['meal prep', 'meal-prep', 'meal prepping', 'prepping meals', 'prep meals'],
  grocery: ['grocery', 'groceries', 'shopping list', 'grocery list'],
  portion: ['portion', 'portions', 'portion control', 'portion size', 'serving', 'servings'],
  tracking: ['track food', 'food log', 'food tracker', 'log food', 'logging food', 'macro tracking', 'calorie tracker', 'myfitnesspal', 'cronometer', 'lose it'],
  dining: ['restaurant', 'dining', 'eat out', 'eating out', 'takeout', 'take-out'],
  alcohol: ['alcohol', 'alcoholic', 'drink', 'drinking', 'beer', 'wine', 'spirits'],
  cheatmeal: ['cheat meal', 'cheatmeal', 'cheat day', 'free meal'],
  refeed: ['refeed', 'refeeds', 'refeeding', 'refeed day', 'carb refeed'],
  dietbreak: ['diet break', 'diet-break'],

  // Metabolism / Physiology
  metabolism: ['metabolism', 'metabolic', 'metabolize'],
  neat: ['neat', 'non-exercise activity thermogenesis'],
  tef: ['tef', 'thermic effect of food'],
  satiety: ['satiety', 'satiating', 'satiated', 'full', 'fullness'],
  hunger: ['hunger', 'hungry', 'appetite'],
  craving: ['craving', 'cravings', 'crave'],
  mindfuleating: ['mindful eating', 'mindfulness eating'],

  // Hydration
  water: ['water', 'hydration', 'hydrated', 'dehydrated', 'hydrate', 'drink water'],
  electrolyte: ['electrolyte', 'electrolytes', 'sodium', 'potassium', 'magnesium', 'calcium'],

  // Supplements
  supplement: ['supplement', 'supplements', 'supplementation'],
  creatine: ['creatine', 'creatine monohydrate'],
  preworkout: ['pre-workout', 'preworkout', 'pre workout', 'pwo'],
  postworkout: ['post-workout', 'postworkout', 'post workout'],
  caffeine: ['caffeine', 'coffee', 'pre-workout stim'],
  vitamin: ['vitamin', 'vitamins', 'multivitamin', 'multi-vitamin'],
  mineral: ['mineral', 'minerals'],
  omega3: ['omega-3', 'omega 3', 'omega3', 'fish oil', 'epa', 'dha', 'omega 6'],
  fiber: ['fiber', 'fibre', 'dietary fiber'],
  sugar: ['sugar', 'sugars', 'sugary', 'added sugar'],
  cholesterol: ['cholesterol'],

  // Advanced nutrition
  glycemic: ['glycemic', 'gi', 'glycemic index', 'glycemic load'],
  insulin: ['insulin', 'insulin sensitivity', 'insulin resistance'],
  glycogen: ['glycogen', 'glycogen depletion', 'glycogen supercompensation'],
  carbloading: ['carb loading', 'carb-loading', 'carb load'],
  carbcycling: ['carb cycling', 'carb-cycling', 'carb cycle'],
  sodiummanipulation: ['sodium manipulation', 'sodium load', 'sodium depletion', 'water loading'],
  watercut: ['water cut', 'water loading', 'water manipulation'],
  peakweek: ['peak week', 'peaking'],
  reversediet: ['reverse diet', 'reverse dieting', 'diet recovery'],
  metabolicadaptation: ['metabolic adaptation', 'adaptive thermogenesis'],

  // AzFIT-specific
  smartswap: ['smart swap', 'smartswap', 'food swap', 'healthy swap', 'healthier alternative', 'smart substitution'],
  nutritionscore: ['nutrition score', 'nutrition scoring'],
  gamification: ['gamification', 'nutrition gamification', 'food game', 'nutrition challenge'],
  mealplan: ['meal plan', 'mealplan', 'meal planning', 'meal schedule', 'diet plan', 'nutrition plan'],
  macroring: ['macro ring', 'macro rings', 'macro donut', 'macro wheel', 'macro chart'],
  adherence: ['adherence', 'compliance', 'nutrition adherence', 'diet compliance', 'sticking to diet'],
  nutrienttiming: ['nutrient timing', 'meal timing'],
  periworkout: ['peri-workout', 'peri workout', 'around workout', 'workout nutrition'],
  intraworkout: ['intra-workout', 'intra workout', 'during workout'],
  digestion: ['digestion', 'digestive', 'digest', 'bloating', 'bloat', 'gut', 'gut health', 'microbiome'],
  breakfast: ['breakfast', 'morning meal'],
  lunch: ['lunch', 'midday meal'],
  dinner: ['dinner', 'evening meal', 'supper'],
  snack: ['snack', 'snacks', 'snacking'],
};

const CLIENT_KEYWORDS: Record<string, string[]> = {
  client: ['client', 'clients', 'member', 'members', 'customer', 'customers', 'trainee'],
  appointment: ['appointment', 'appointments', 'appt', 'booking', 'bookings', 'book', 'reservation'],
  schedule: ['schedule', 'scheduling', 'scheduled', 'timetable', 'calendar', 'slot', 'slots'],
  session: ['session', 'sessions', 'training session', 'workout session', 'pt session'],
  checkin: ['check-in', 'checkin', 'check in', 'attendance', 'checked in', 'arrived'],
  lead: ['lead', 'leads', 'prospect', 'prospects', 'inquiry', 'enquiry', 'potential client'],
  onboarding: ['onboarding', 'onboard', 'new client setup', 'client intake', 'welcome'],
  intake: ['intake', 'intake form', 'client intake', 'new client form'],
  assessment: ['assessment', 'assessments', 'fitness assessment', 'initial assessment', 'eval', 'evaluation'],
  parq: ['par-q', 'parq', 'physical activity readiness'],
  bioprint: ['bioprint', 'bio-print', 'body print'],
  bodycomposition: ['body composition', 'body comp', 'composition', 'dexa', 'inbody'],
  goalsetting: ['goal setting', 'set goals', 'goal', 'goals', 'smart goal', 'smart goals'],
  progresstracking: ['progress tracking', 'track progress', 'progress', 'progression'],
  measurement: ['measurement', 'measurements', 'measure', 'body measurement', 'circumference', 'inch', 'inches'],
  photo: ['photo', 'photos', 'progress photo', 'before photo', 'after photo'],
  weighin: ['weigh-in', 'weighin', 'weigh in', 'check weight', 'weight check'],
  followup: ['follow-up', 'followup', 'follow up', 'follow-up session', 'check-in call'],
  retention: ['retention', 'retain', 'keeping clients', 'client loyalty', 'loyalty'],
  churn: ['churn', 'attrition', 'cancellation', 'cancel', 'cancelled', 'canceling', 'drop off'],
  noshow: ['no-show', 'noshow', 'no show', 'did not show', 'missed appointment'],
  late: ['late', 'lateness', 'tardy', 'running late'],
  reschedule: ['reschedule', 'rescheduling', 'moved appointment', 'change time'],
  transfer: ['transfer', 'reassign', 'hand over', 'pass client'],
  referral: ['referral', 'refer', 'referred', 'referrals', 'word of mouth'],
  testimonial: ['testimonial', 'testimonials', 'review', 'reviews', 'feedback'],
  satisfaction: ['satisfaction', 'satisfied', 'happy client', 'client happiness', 'nps', 'net promoter'],
  communication: ['communication', 'communicate', 'reach out', 'contact client', 'message client'],
  reminder: ['reminder', 'reminders', 'remind', 'notification', 'alert'],
  waiver: ['waiver', 'waivers', 'liability waiver', 'release form'],
  consent: ['consent', 'consent form', 'informed consent'],
  privacy: ['privacy', 'confidentiality'],
  hipaa: ['hipaa', 'phi', 'protected health information'],
  gdpr: ['gdpr', 'data protection', 'personal data'],

  // Billing / Payments
  billing: ['billing', 'billing question', 'charge', 'charges'],
  payment: ['payment', 'payments', 'pay', 'paid', 'paying', 'unpaid', 'overdue'],
  invoice: ['invoice', 'invoices', 'invoicing'],
  receipt: ['receipt', 'receipts'],
  refund: ['refund', 'refunds', 'refunding', 'money back'],
  package: ['package', 'packages', 'session package', 'bundle', 'bundles'],
  membership: ['membership', 'memberships', 'subscription', 'subscriptions', 'sub'],
  tier: ['tier', 'tiers', 'plan tier', 'pricing tier'],
  bronze: ['bronze', 'bronze tier', 'bronze plan'],
  silver: ['silver', 'silver tier', 'silver plan'],
  gold: ['gold', 'gold tier', 'gold plan'],
  platinum: ['platinum', 'platinum tier', 'platinum plan'],
  promo: ['promo', 'promotion', 'promotional', 'discount', 'discounted', 'coupon', 'voucher', 'code'],
  trial: ['trial', 'free trial', 'free session', 'complimentary', 'complimentary session'],
  consultation: ['consultation', 'consult', 'consultations', 'initial consultation', 'discovery call'],

  // Coaching / Program updates
  strategy: ['strategy', 'strategies', 'fitness strategy', 'coaching strategy'],
  goalreview: ['goal review', 'review goals', 'goal check-in'],
  programupdate: ['program update', 'update program', 'modify program', 'change program'],
  exercisemodification: ['exercise modification', 'modify exercise', 'exercise swap', 'exercise change'],
  adaptive: ['adaptive', 'adaptation', 'adaptive training', 'personalized program', 'individualized'],
  pregnancy: ['pregnancy', 'pregnant', 'prenatal', 'postpartum', 'post-natal'],
  seniorfitness: ['senior fitness', 'senior', 'elderly', 'older adult', 'aging'],
  youth: ['youth', 'youth fitness', 'teen', 'teenager', 'adolescent', 'child', 'kids'],
  athlete: ['athlete', 'athletes', 'sport-specific', 'sports performance', 'performance training'],

  // Wellness / Lifestyle
  sleep: ['sleep', 'sleep hygiene', 'rest', 'rested', 'insomnia', 'recovery sleep'],
  stress: ['stress', 'stressed', 'stress management', 'cortisol', 'mental health'],
  motivation: ['motivation', 'motivated', 'unmotivated', 'demotivated', 'motivate'],
  adherence: ['adherence', 'compliance', 'habit', 'habits', 'behavior', 'behaviour', 'behavioral'],
  accountability: ['accountability', 'accountable', 'check-in partner'],
  coaching: ['coaching', 'coach', 'personal trainer', 'pt', 'trainer'],

  // Notes / Documentation
  soapnote: ['soap note', 'soap', 'subjective objective assessment plan'],
  sessionnotes: ['session notes', 'training notes', 'workout notes'],
  traininglog: ['training log', 'client training log'],
  prtracker: ['pr tracker', 'pr tracking', 'personal record tracker'],
  milestone: ['milestone', 'milestones', 'achievement', 'achievements'],
  badge: ['badge', 'badges', 'award', 'awards'],
  leaderboard: ['leaderboard', 'ranking', 'rankings'],
  challenge: ['challenge', 'challenges', 'fitness challenge', 'transformation challenge'],
  transformation: ['transformation', 'transformations', 'body transformation', 'before/after', 'before and after'],

  // Dashboard / UI
  trainerdashboard: ['trainer dashboard', 'coach dashboard', 'dashboard'],
  clientdirectory: ['client directory', 'client list', 'all clients', 'client roster'],
  clientprofile: ['client profile', 'client details', 'client info', 'client information'],
};

const GENERAL_KEYWORDS: Record<string, string[]> = {
  help: ['help', 'help me', 'how do i', 'how do you', 'how to', 'how can', 'guide', 'tutorial', 'explain'],
  support: ['support', 'customer support', 'contact support', 'get help', 'assistance'],
  question: ['question', 'questions', 'ask', 'faq', 'faqs', 'what is', 'what are', 'define', 'definition'],
  compare: ['compare', 'comparison', 'vs', 'versus', 'difference', 'differences', 'diff'],
  proscons: ['pros and cons', 'advantages', 'disadvantages', 'benefits', 'drawbacks'],
  risks: ['risk', 'risks', 'safety', 'safe', 'dangerous', 'danger'],
  evidence: ['evidence', 'research', 'study', 'studies', 'science', 'scientific', 'paper', 'literature', 'meta-analysis'],
  beginner: ['beginner', 'beginners', 'newbie', 'new to fitness', 'starting out', 'just started'],
  intermediate: ['intermediate', 'intermediates'],
  advanced: ['advanced', 'elite', 'experienced', 'veteran'],
  terminology: ['terminology', 'terms', 'glossary', 'jargon', 'acronym'],
  history: ['history', 'historical', 'origin', 'origins', 'background'],
  trend: ['trend', 'trends', 'trending', 'popular', 'hype'],
  biohacking: ['biohacking', 'biohacker', 'nootropic', 'cold plunge', 'ice bath', 'sauna'],
  longevity: ['longevity', 'long life', 'anti-aging', 'antiaging', 'lifespan', 'healthspan'],
  wellness: ['wellness', 'well-being', 'wellbeing', 'holistic'],
  health: ['health', 'healthy', 'unhealthy', 'healthier'],
  fitnessindustry: ['fitness industry', 'industry'],

  // Certifications
  certification: ['certification', 'certifications', 'certified', 'credential', 'credentials', 'accredited'],
  ace: ['ace', 'ace certified', 'american council on exercise'],
  nasm: ['nasm', 'nasm cpt', 'national academy of sports medicine'],
  acsm: ['acsm', 'american college of sports medicine'],
  nsca: ['nsca', 'nsca-cscs', 'cscs', 'national strength and conditioning association'],
  issa: ['issa', 'international sports sciences association'],
  cpt: ['cpt', 'certified personal trainer', 'personal training certification'],

  // Business
  personaltrainer: ['personal trainer', 'personal training', 'pt'],
  onlinecoach: ['online coach', 'online coaching', 'virtual coach', 'remote coaching'],
  gymowner: ['gym owner', 'gym ownership', 'gym management', 'studio owner'],
  studio: ['studio', 'fitness studio', 'boutique studio'],
  franchise: ['franchise', 'franchising', 'fitness franchise'],
  career: ['career', 'careers', 'job', 'jobs', 'employment', 'hire', 'hiring'],
  business: ['business', 'biz', 'company', 'entrepreneur', 'entrepreneurship'],
  marketing: ['marketing', 'advertise', 'advertising', 'promote', 'promotion'],
  socialmedia: ['social media', 'instagram', 'youtube', 'tiktok', 'content', 'content creation', 'influencer'],
  pricing: ['pricing', 'price', 'prices', 'cost', 'costs', 'how much', 'fee', 'fees', 'rate', 'rates'],
  packaging: ['packaging', 'service package', 'service tier'],
  niche: ['niche', 'specialization', 'specialize', 'specialty'],
  ceu: ['ceu', 'continuing education', 'cecs', 'continuing education units'],

  // Specializations
  correctiveexercise: ['corrective exercise specialist', 'corrective exercise'],
  performance: ['performance enhancement', 'sports performance', 'athletic performance', 'athletic'],
  sportsnutrition: ['sports nutrition', 'sports nutritionist', 'sports dietitian'],
  behaviorchange: ['behavior change', 'behavioral change', 'habit coach'],
  healthcoaching: ['health coaching', 'health coach', 'wellness coach'],
  mindset: ['mindset', 'mental game', 'psychology', 'psychological', 'cognitive'],
  flowstate: ['flow state', 'flow', 'in the zone', 'being in flow'],
  motivationtheory: ['motivation theory', 'motivational interviewing', 'self-determination theory'],
  intrinsic: ['intrinsic motivation', 'intrinsic', 'intrinsically'],
  extrinsic: ['extrinsic motivation', 'extrinsic', 'extrinsically'],

  // Philosophy
  bodypositivity: ['body positivity', 'body positive', 'body acceptance'],
  haes: ['haes', 'health at every size'],
  inclusivity: ['inclusivity', 'inclusive', 'accessible', 'accessibility'],
  adaptiveequipment: ['adaptive equipment', 'adaptive fitness', 'disability fitness', 'special population'],

  // Home / Commercial gym
  homegym: ['home gym', 'garage gym', 'basement gym', 'home setup', 'home equipment'],
  commercialgym: ['commercial gym', 'globo gym', 'big box gym', 'chain gym'],
  bootcamp: ['bootcamp', 'boot camp', 'group training', 'group workout'],
  groupfitness: ['group fitness', 'group class', 'group exercise', 'group ex', 'aerobics class'],

  // Wearables
  wearable: ['wearable', 'wearables', 'fitness tracker', 'activity tracker', 'tracking device'],
  smartwatch: ['smartwatch', 'smart watch'],
  applewatch: ['apple watch', 'applewatch', 'watchos'],
  garmin: ['garmin'],
  fitbit: ['fitbit'],
  whoop: ['whoop', 'whoop band'],
  oura: ['oura', 'oura ring'],
  hrv: ['hrv', 'heart rate variability'],
  vo2max: ['vo2 max', 'vo2max', 'maximal oxygen uptake'],
  heartrate: ['heart rate', 'heartrate', 'hr', 'bpm', 'pulse', 'resting heart rate', 'max heart rate'],

  // AzFIT / Platform
  azfit: ['azfit', 'aztechfit', 'az tech fit', 'az-tech-fit', 'platform', 'app', 'portal'],
  hongkong: ['hong kong', 'hk', 'asia', 'asian'],
  trainerportal: ['trainer portal', 'coach portal', 'trainer app'],
  clientportal: ['client portal', 'member portal'],
  analytics: ['analytics', 'report', 'reports', 'reporting', 'data', 'statistics', 'stats', 'metric', 'metrics'],
  smartswap: ['smart swap', 'smartswap'],
  datadriven: ['data-driven', 'data driven', 'evidence based', 'evidence-based'],
  sparkline: ['sparkline', 'sparklines', 'mini chart', 'trend line'],
  insight: ['insight', 'insights', 'insightful'],
  optimization: ['optimization', 'optimize', 'optimise', 'optimizing'],

  // Platform features
  programdesign: ['program design', 'design program'],
  workoutbuilder: ['workout builder', 'builder'],
  exerciselibrary: ['exercise library', 'exercise db', 'movement library'],
  sessionlogging: ['session logging', 'log session'],
  meallogging: ['meal logging', 'log meal'],
  export: ['export', 'export data', 'download data', 'download'],
  import: ['import', 'import data', 'upload', 'upload data'],
  sync: ['sync', 'synchronize', 'integration', 'connect', 'connected', 'connection'],

  // UI / Settings
  darkmode: ['dark mode', 'dark theme', 'night mode'],
  lightmode: ['light mode', 'light theme'],
  theme: ['theme', 'themes', 'theming', 'color scheme', 'colour scheme'],
  customization: ['customization', 'customize', 'customise', 'personalize', 'personalization'],
  personalization: ['personalization', 'personalisation'],
  setting: ['setting', 'settings', 'preference', 'preferences', 'options', 'config', 'configuration'],
  profile: ['profile', 'profiles', 'my profile', 'user profile'],
  account: ['account', 'my account', 'account settings'],
  subscription: ['subscription', 'subscribe', 'plan', 'membership plan'],
  security: ['security', 'secure', 'privacy setting'],
  password: ['password', 'passwords', 'forgot password', 'reset password'],

  // Support actions
  contact: ['contact', 'contact us', 'contact support', 'reach us', 'email us'],
  reportbug: ['report bug', 'bug report', 'bug', 'bugs', 'issue', 'issues', 'problem', 'broken'],
  requestfeature: ['request feature', 'feature request', 'suggestion', 'new feature', 'idea'],
  feedback: ['feedback', 'give feedback', 'send feedback'],
  refer: ['refer', 'refer a friend', 'referral program', 'refer and earn'],
  invite: ['invite', 'invitation', 'invite friend', 'invite trainer'],

  // Developer / Technical
  api: ['api', 'apis', 'rest api', 'graphql', 'endpoint', 'developer api'],
  developer: ['developer', 'developers', 'dev', 'programmer', 'coding'],
  integration: ['integration', 'zapier', 'webhook', 'webhooks', 'automation', 'automate', 'zap'],
  sso: ['sso', 'single sign on', 'single sign-on', 'saml', 'oauth'],
  twofa: ['two-factor', 'two factor', '2fa', 'mfa', 'multi-factor', 'multi factor authentication'],
  biometric: ['biometric', 'biometrics', 'face id', 'touch id', 'fingerprint', 'face recognition'],

  // Legal / Compliance
  privacypolicy: ['privacy policy', 'privacy notice'],
  termsofservice: ['terms of service', 'terms', 'terms of use', 'tos', 'eula'],
  cookie: ['cookie', 'cookies', 'cookie consent', 'cookie banner'],
  consent: ['consent', 'consent management', 'consent banner'],
  dataprotection: ['data protection', 'data security', 'data privacy'],
  backup: ['backup', 'backups', 'data backup', 'restore', 'data restore'],
  deleteaccount: ['delete account', 'close account', 'deactivate account', 'remove account'],
};

// ═══════════════════════════════════════════════════════════════
// Crisis & Medical keyword detection
// ═══════════════════════════════════════════════════════════════

const CRISIS_KEYWORDS = [
  'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die',
  'self-harm', 'self harm', 'cutting myself', 'hurt myself',
];

const MEDICAL_KEYWORDS = [
  'diagnose', 'diagnosis', 'disease', 'medical condition', 'treatment',
  'medication', 'prescription', 'doctor', 'physician', 'therapist',
  'surgery', 'surgical', 'chronic', 'acute', 'pathology', 'pathological',
  'cancer', 'diabetes', 'heart disease', 'kidney', 'liver disease',
];

// ═══════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s\-\/]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function scoreContext(
  tokens: string[],
  keywordDB: Record<string, string[]>
): number {
  let score = 0;
  const fullText = tokens.join(' ');

  for (const [, phrases] of Object.entries(keywordDB)) {
    for (const phrase of phrases) {
      if (fullText.includes(phrase)) {
        const wordsInPhrase = phrase.split(/\s+/).length;
        score += wordsInPhrase >= 2 ? 1.5 : 1.0;
      }
    }
  }

  // Also check individual token matches for shorter keywords
  for (const token of tokens) {
    if (token.length <= 2) continue;
    for (const [, phrases] of Object.entries(keywordDB)) {
      for (const phrase of phrases) {
        if (phrase === token) {
          score += 0.5;
        }
      }
    }
  }

  return score;
}

// ═══════════════════════════════════════════════════════════════
// Main Export: classifyIntent
// ═══════════════════════════════════════════════════════════════

export function classifyIntent(
  input: string,
  pageContext: PageContext,
  userType: string,
  history: ChatContext[]
): IntentResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      action: 'clarifying_question',
      context: pageContext.primaryContext,
      confidence: 0,
    };
  }

  // ── 1. Check for crisis keywords ──────────────────────────────
  const lowerInput = trimmed.toLowerCase();
  const isCrisis = CRISIS_KEYWORDS.some((kw) => lowerInput.includes(kw));
  if (isCrisis) {
    return {
      action: 'off_topic_redirect',
      context: 'general',
      confidence: 1,
    };
  }

  // ── 2. Check for medical keywords ─────────────────────────────
  const isMedical = MEDICAL_KEYWORDS.some((kw) => lowerInput.includes(kw));
  if (isMedical) {
    return {
      action: 'off_topic_redirect',
      context: 'general',
      confidence: 1,
    };
  }

  // ── 3. Tokenize input ─────────────────────────────────────────
  const tokens = tokenize(trimmed);
  if (tokens.length === 0) {
    return {
      action: 'clarifying_question',
      context: pageContext.primaryContext,
      confidence: 0,
    };
  }

  // ── 4. Score each context ─────────────────────────────────────
  const rawScores: Record<ChatContext, number> = {
    workout: scoreContext(tokens, WORKOUT_KEYWORDS),
    nutrition: scoreContext(tokens, NUTRITION_KEYWORDS),
    client: scoreContext(tokens, CLIENT_KEYWORDS),
    general: scoreContext(tokens, GENERAL_KEYWORDS),
  };

  // ── 5. Apply page context weight (1.3x) ──────────────────────
  const primary = pageContext.primaryContext;
  rawScores[primary] = rawScores[primary] * 1.3;

  // ── 6. Apply user type modifier (+20% for trainers on client context)
  if (userType === 'trainer' || userType === 'admin') {
    rawScores.client = rawScores.client * 1.2;
  }

  // ── 7. Apply history weight (+10% for last context)
  if (history.length > 0) {
    const lastContext = history[history.length - 1];
    if (lastContext in rawScores) {
      rawScores[lastContext] = rawScores[lastContext] * 1.1;
    }
  }

  // ── 8. Normalize scores ──────────────────────────────────────
  const maxPossible = Math.max(tokens.length * 0.3, 1);
  const normalized: Record<ChatContext, number> = {
    workout: Math.min(rawScores.workout / maxPossible, 1.0),
    nutrition: Math.min(rawScores.nutrition / maxPossible, 1.0),
    client: Math.min(rawScores.client / maxPossible, 1.0),
    general: Math.min(rawScores.general / maxPossible, 1.0),
  };

  // ── 9. Determine best context ────────────────────────────────
  const entries = Object.entries(normalized) as [ChatContext, number][];
  entries.sort((a, b) => b[1] - a[1]);

  const bestContext = entries[0][0];
  const bestScore = entries[0][1];
  const secondScore = entries[1]?.[1] ?? 0;

  // ── 10. Collect secondary contexts ───────────────────────────
  const secondaryContexts: ChatContext[] = [];
  for (const [ctx, score] of entries.slice(1)) {
    if (score > 0.3 && score >= bestScore * 0.6) {
      secondaryContexts.push(ctx);
    }
  }

  // ── 11. Determine routing action ─────────────────────────────
  let action: IntentResult['action'];

  const contextsAbove04 = entries.filter(([, s]) => s > 0.4).length;

  if (bestScore > 0.8) {
    action = 'direct_route';
  } else if (bestScore > 0.5) {
    action = 'route_with_confirmation';
  } else if (contextsAbove04 >= 2) {
    action = 'cross_context_bridge';
  } else if (bestScore > 0.3) {
    action = 'clarifying_question';
  } else if (bestScore < 0.1) {
    action = 'off_topic_redirect';
  } else {
    action = 'clarifying_question';
  }

  // ── 12. Special case: strong secondary with similar score ────
  if (action === 'route_with_confirmation' && secondScore > bestScore * 0.85) {
    secondaryContexts.unshift(entries[1][0]);
    action = 'cross_context_bridge';
  }

  return {
    action,
    context: bestContext,
    confidence: Math.round(bestScore * 100) / 100,
    secondaryContexts: secondaryContexts.length > 0 ? secondaryContexts : undefined,
  };
}
