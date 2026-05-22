import type { ChatContext, IntentResult, PageContext } from './types';

// ═══════════════════════════════════════════════════════════════
// Response Variations by Context
// ═══════════════════════════════════════════════════════════════

interface ResponseSet {
  patterns: string[];
  responses: string[];
  suggestions: string[];
}

// ── WORKOUT RESPONSES ──────────────────────────────────────────

const WORKOUT_RESPONSES: ResponseSet[] = [
  {
    patterns: ['create workout', 'build workout', 'new workout', 'program design', 'make a workout', 'design program'],
    responses: [
      'I can design a workout program for you. What\'s your primary goal \u2014 strength, hypertrophy, endurance, or fat loss?',
      'Let\'s build a great program! Are you training for strength, muscle growth, athletic performance, or general fitness?',
      'I\'d love to help create your workout. What\'s your training experience level and main goal?',
    ],
    suggestions: ['Strength', 'Hypertrophy', 'Endurance', 'Fat Loss', 'General Fitness'],
  },
  {
    patterns: ['exercise info', 'what is', 'how to do', 'exercise', 'explain exercise', 'exercise details'],
    responses: [
      'I can explain any exercise in detail. Which one would you like help with \u2014 form, alternatives, or progression?',
      'Ask me about any exercise! I can cover form cues, common mistakes, muscle targeting, and progression strategies.',
      'I\'ve got exercise info ready. Are you looking for form tips, exercise variations, or muscle activation details?',
    ],
    suggestions: ['Form Cues', 'Alternatives', 'Progression', 'Muscle Targeting'],
  },
  {
    patterns: ['log exercise', 'log workout', 'session log', 'record workout', 'track workout', 'training log'],
    responses: [
      'Great job training! What exercise did you complete, and what were your sets/reps/weight?',
      'Let\'s log that session! What exercise, how many sets/reps, and what weight did you use?',
      'Awesome work! Share the exercise name, sets, reps, and weight and I\'ll record it for you.',
    ],
    suggestions: ['Log Squats', 'Log Bench', 'Log Deadlift', 'View History'],
  },
  {
    patterns: ['1rm', 'onerm', 'pr', 'rpe', 'rir', 'volume', 'intensity', 'frequency', 'training metrics', 'calculate'],
    responses: [
      'I can calculate 1RM estimates, RPE guidelines, volume landmarks (MEV/MRV), and more. What would you like to know?',
      'Need training metrics? I can estimate 1RM, suggest RPE targets, and explain volume/intensity relationships.',
      'Training data is my specialty! Ask about 1RM estimation, optimal volume, periodization, or recovery needs.',
    ],
    suggestions: ['Calculate 1RM', 'RPE Guide', 'Volume Landmarks', 'Periodization'],
  },
  {
    patterns: ['compare program', 'vs program', 'program comparison', 'which program', 'split comparison'],
    responses: [
      'I can compare different training approaches. Which programs or methods are you considering?',
      'Let\'s break down the differences! Which training styles or splits are you deciding between?',
      'I\'ll help you compare programs. Are you looking at PPL vs Upper/Lower, or something else?',
    ],
    suggestions: ['PPL vs Upper/Lower', 'Full Body vs Split', 'Strength vs Hypertrophy'],
  },
  {
    patterns: ['form check', 'form help', 'correct form', 'bad form', 'fix form', 'form cues'],
    responses: [
      'Send me details about the exercise and I can provide form cues, common mistakes, and safety tips.',
      'I can help with form! Tell me the exercise and I\'ll give you key cues and error corrections.',
      'Form is everything. Which exercise needs attention? I\'ll provide step-by-step cues and safety notes.',
    ],
    suggestions: ['Squat Form', 'Deadlift Form', 'Bench Form', 'Overhead Press'],
  },
  {
    patterns: ['warm-up', 'warmup', 'cool-down', 'cooldown', 'before workout', 'after workout', 'activation'],
    responses: [
      'A good warm-up should include: general cardio (3-5 min), dynamic stretches, activation exercises for target muscles, and specific warm-up sets. Want me to design one for your workout?',
      'Warm-ups are crucial! I can build a targeted routine with activation drills and mobility work. What\'s today\'s workout?',
      'Let me design your warm-up! What exercises are you training today? I\'ll target the right muscles for activation.',
    ],
    suggestions: ['Design Warm-up', 'Activation Drills', 'Cool-down Routine', 'Foam Rolling'],
  },
  {
    patterns: ['progressive overload', 'deload', 'periodization', 'programming', 'advance program'],
    responses: [
      'Progressive overload is the key to gains! I can help with load progression, deload timing, and periodization schemes. What aspect interests you?',
      'Smart programming makes all the difference. Ask me about linear progression, undulating periodization, or deload strategies.',
      'I can guide you through periodization, overload methods, and when to deload. What would you like to explore?',
    ],
    suggestions: ['Progressive Overload', 'Deload Strategy', 'Periodization', 'Linear vs Undulating'],
  },
];

// ── NUTRITION RESPONSES ────────────────────────────────────────

const NUTRITION_RESPONSES: ResponseSet[] = [
  {
    patterns: ['nutrition info', 'nutrient', 'food info', 'macro info', 'what are macros', 'explain nutrition'],
    responses: [
      'I can help with nutrition facts, macro breakdowns, and dietary recommendations. What food or nutrient are you asking about?',
      'Nutrition science made simple! Ask about any food, nutrient, or dietary concept and I\'ll break it down.',
      'I\'ve got nutrition knowledge ready. Which food, nutrient, or dietary topic would you like to explore?',
    ],
    suggestions: ['Protein Sources', 'Carb Types', 'Healthy Fats', 'Fiber Intake'],
  },
  {
    patterns: ['log meal', 'track food', 'food log', 'record meal', 'meal log', 'ate', 'what i ate'],
    responses: [
      'What did you eat? Share the meal details and I\'ll help estimate macros and calories.',
      'Let\'s log that meal! Describe what you ate and I\'ll break down the approximate macros.',
      'Meal logging time! What foods and portions did you have? I can estimate calories and macros for you.',
    ],
    suggestions: ['Log Breakfast', 'Log Lunch', 'Log Dinner', 'Log Snack'],
  },
  {
    patterns: ['tdee', 'bmr', 'calorie calculator', 'macro calculator', 'calculate macros', 'how many calories', 'how much should i eat'],
    responses: [
      'I can calculate your TDEE, BMR, and optimal macro splits. What\'s your age, weight, height, activity level, and goal?',
      'Let\'s crunch the numbers! Share your stats (age, weight, height, activity, goal) and I\'ll calculate everything.',
      'I\'ll build your nutrition profile! Just tell me your age, weight, height, training frequency, and goal.',
    ],
    suggestions: ['Cutting Calories', 'Bulking Calories', 'Maintenance', 'Macro Split'],
  },
  {
    patterns: ['meal plan', 'create meal plan', 'diet plan', 'eating plan', 'meal schedule', 'plan my meals'],
    responses: [
      'I can design a meal plan. What\'s your calorie target, dietary preferences, and meal frequency?',
      'Let\'s build your meal plan! How many meals per day, any dietary restrictions, and what\'s your calorie target?',
      'A structured meal plan can make all the difference. What are your calories, preferences, and meal count?',
    ],
    suggestions: ['3 Meals/Day', '4 Meals/Day', 'With Snacks', 'Intermittent Fasting'],
  },
  {
    patterns: ['smart swap', 'food swap', 'healthy swap', 'alternative', 'substitute', 'better option', 'healthier'],
    responses: [
      'I can suggest healthier alternatives. What food would you like to swap, and what\'s your goal \u2014 lower calories, higher protein, or something else?',
      'Smart swaps are a game-changer! What food do you want to replace, and what\'s your nutrition target?',
      'Let me find a better option! What food are you swapping and what\'s the priority \u2014 fewer calories, more protein, less sugar?',
    ],
    suggestions: ['Lower Calories', 'Higher Protein', 'Less Sugar', 'More Fiber'],
  },
  {
    patterns: ['supplement', 'creatine', 'protein powder', 'pre-workout', 'vitamin', 'should i take'],
    responses: [
      'I can provide evidence-based supplement guidance. Which supplement are you curious about?',
      'Supplements can help, but only the right ones! Ask me about any supplement and I\'ll give you the research-backed facts.',
      'Let\'s talk supplements! Which one are you considering \u2014 creatine, protein, pre-workout, or something else?',
    ],
    suggestions: ['Creatine', 'Whey Protein', 'Pre-Workout', 'Multivitamin'],
  },
  {
    patterns: ['plateau', 'stuck', 'not losing weight', 'stopped losing', 'weight loss stalled', 'metabolic adaptation'],
    responses: [
      'Weight loss plateaus are common. Let\'s audit your intake, check for metabolic adaptation, or discuss a strategic refeed.',
      'Plateaus happen! I can help you break through with refeed strategies, diet breaks, or intake adjustments.',
      'Stuck on your cut? Let\'s troubleshoot \u2014 we can review your intake, consider a refeed, or adjust your approach.',
    ],
    suggestions: ['Audit My Intake', 'Strategic Refeed', 'Diet Break', 'Reverse Diet'],
  },
  {
    patterns: ['cutting', 'bulking', 'recomp', 'diet break', 'refeed', 'reverse diet', 'diet phase'],
    responses: [
      'Each diet phase has its own strategy. I can help you set up cutting, bulking, or recomp protocols. Which phase are you in?',
      'Nutrition phases require different approaches. Are you cutting, bulking, maintaining, or trying to recomp?',
      'I can guide you through any nutrition phase. What\'s your current goal \u2014 fat loss, muscle gain, or body recomposition?',
    ],
    suggestions: ['Cutting Guide', 'Bulking Guide', 'Recomp Guide', 'Maintenance'],
  },
];

// ── CLIENT RESPONSES ───────────────────────────────────────────

const CLIENT_RESPONSES: ResponseSet[] = [
  {
    patterns: ['schedule session', 'book session', 'new appointment', 'book appointment', 'schedule training'],
    responses: [
      'I can help you schedule a session. What date and time works best?',
      'Let\'s get that session booked! What date and time slot do you prefer?',
      'I\'ll help you find a time. What day and time works for your schedule?',
    ],
    suggestions: ['This Week', 'Next Week', 'Morning', 'Evening'],
  },
  {
    patterns: ['reschedule', 'change appointment', 'move session', 'different time', 'can we move'],
    responses: [
      'No problem. What new time works for you?',
      'Sure, let\'s reschedule. What alternative date and time would you prefer?',
      'I can help move that session. What\'s your preferred new date and time?',
    ],
    suggestions: ['Tomorrow', 'Next Week', 'Same Day Different Time', 'Cancel Instead'],
  },
  {
    patterns: ['client info', 'client query', 'find client', 'client details', 'look up client', 'search client'],
    responses: [
      'I can look up client information. Which client are you asking about?',
      'Let me help you find that client. What\'s their name or client ID?',
      'I\'ll pull up the client details. Who are you looking for?',
    ],
    suggestions: ['Recent Clients', 'Active Clients', 'Search by Name'],
  },
  {
    patterns: ['log progress', 'record measurement', 'new weigh-in', 'progress photo', 'body composition', 'measurements'],
    responses: [
      'Let\'s record those measurements. What are the new stats?',
      'Time to log progress! What measurements, weight, or photos do you have?',
      'I\'ll help document the progress. What are the latest numbers?',
    ],
    suggestions: ['Body Weight', 'Body Measurements', 'Progress Photo', 'Body Fat %'],
  },
  {
    patterns: ['update program', 'modify program', 'change program', 'program update', 'adjust workout'],
    responses: [
      'I can help modify a client\'s program. What changes are needed?',
      'Program adjustments are part of the process. What exercises, volume, or intensity changes do you need?',
      'Let me help you update that program. What specific modifications are you making?',
    ],
    suggestions: ['Swap Exercises', 'Adjust Volume', 'Change Intensity', 'New Phase'],
  },
  {
    patterns: ['billing', 'payment', 'invoice', 'refund', 'charge', 'failed payment', 'payment issue'],
    responses: [
      'I can help with billing questions. What\'s the issue \u2014 payment failed, refund request, or invoice question?',
      'Let\'s sort out the billing. Are you dealing with a failed payment, refund, or invoice query?',
      'I\'ll help with the payment issue. What\'s the specific billing concern?',
    ],
    suggestions: ['Failed Payment', 'Refund Request', 'Invoice Question', 'Update Payment Method'],
  },
  {
    patterns: ['retention', 'keep clients', 'client engagement', 'follow-up', 'client satisfaction', 'churn'],
    responses: [
      'Client retention is key to a thriving business. Would you like tips on engagement strategies, follow-up protocols, or progress review scheduling?',
      'Keeping clients engaged is crucial! I can help with follow-up systems, check-in cadences, or reward programs.',
      'Retention strategies make a huge difference. Want help with follow-up protocols, progress reviews, or engagement tactics?',
    ],
    suggestions: ['Engagement Strategies', 'Follow-up Protocols', 'Progress Reviews', 'Reward Programs'],
  },
];

// ── GENERAL RESPONSES ──────────────────────────────────────────

const GENERAL_RESPONSES: ResponseSet[] = [
  {
    patterns: ['platform help', 'azfit help', 'how does azfit work', 'what is azfit', 'app help', 'portal help'],
    responses: [
      'AzFIT connects trainers and clients through assessments, smart programs, and real-time progress tracking. What would you like to explore?',
      'Welcome to AzFIT by AzTechFit Hong Kong! I can help you navigate the platform. What feature interests you?',
      'AzFIT is your all-in-one fitness platform. Ask me about workouts, nutrition tracking, client management, or analytics!',
    ],
    suggestions: ['Workout Builder', 'Nutrition Tracking', 'Client Management', 'Analytics'],
  },
  {
    patterns: ['certification', 'nasm', 'ace', 'acsm', 'nsca', 'issa', 'cpt', 'which certification', 'cert comparison'],
    responses: [
      'Popular certifications include NASM, ACE, ACSM, NSCA-CSCS, and ISSA. Each has different specializations. Want me to compare them?',
      'The top fitness certifications are NASM, ACE, ACSM, NSCA-CSCS, and ISSA. I can break down each one for you.',
      'Choosing the right cert matters! NASM excels in corrective exercise, NSCA-CSCS in strength & conditioning, ACE in general training. Which path interests you?',
    ],
    suggestions: ['NASM vs ACE', 'ACSM vs NSCA', 'ISSA Overview', 'CPT Comparison'],
  },
  {
    patterns: ['business advice', 'grow business', 'get clients', 'pricing', 'marketing fitness', 'fitness business'],
    responses: [
      'Growing a fitness business requires strong systems. I can help with pricing strategies, client acquisition, retention tactics, and scaling workflows.',
      'Building a successful fitness biz? I\'ve got tips on pricing, marketing, retention, and operational efficiency.',
      'I can help you grow! Ask about pricing models, marketing funnels, client onboarding, or workflow automation.',
    ],
    suggestions: ['Pricing Strategies', 'Client Acquisition', 'Retention Tactics', 'Workflow Automation'],
  },
  {
    patterns: ['wearable', 'sync device', 'apple watch', 'fitbit', 'garmin', 'whoop', 'oura', 'connect device', 'tracker'],
    responses: [
      'AzFIT can integrate with Apple Watch, Fitbit, Garmin, Whoop, and Oura. Which device are you trying to connect?',
      'We support major wearables! Apple Watch, Garmin, Fitbit, Whoop, and Oura all sync with AzFIT. Which one do you have?',
      'Device syncing is easy in AzFIT. What wearable are you using \u2014 Apple Watch, Garmin, Fitbit, Whoop, or Oura?',
    ],
    suggestions: ['Apple Watch', 'Garmin', 'Fitbit', 'Whoop', 'Oura'],
  },
  {
    patterns: ['export data', 'download data', 'export report', 'data export', 'backup data', 'csv', 'pdf'],
    responses: [
      'You can export client data, workout logs, nutrition records, and progress reports. What format do you need \u2014 CSV, PDF, or JSON?',
      'AzFIT supports data exports in multiple formats. What are you exporting \u2014 workouts, nutrition, client reports, or everything?',
      'I can help you export data. Which format works best \u2014 CSV for spreadsheets, PDF for reports, or JSON for developers?',
    ],
    suggestions: ['Export as CSV', 'Export as PDF', 'Export as JSON', 'Full Backup'],
  },
  {
    patterns: ['getting started', 'new user', 'welcome', 'first time', 'setup', 'onboarding', 'how to start'],
    responses: [
      'Welcome to AzFIT by AzTechFit Hong Kong! Are you a trainer or client? I can guide you through the setup process.',
      'New to AzFIT? No problem! Tell me if you\'re a trainer or client and I\'ll walk you through getting started.',
      'Getting started is easy! Are you here as a personal trainer, fitness coach, or client? I\'ll tailor the guide for you.',
    ],
    suggestions: ['I\'m a Trainer', 'I\'m a Client', 'Tour the Platform', 'Watch Tutorial'],
  },
  {
    patterns: ['pricing', 'cost', 'how much', 'subscription', 'plan price', 'membership cost', 'free trial'],
    responses: [
      'You can view all pricing plans at /subscribe. Would you like me to explain what\'s included in each tier?',
      'AzFIT has plans for every stage. Check /subscribe for current pricing. Want a breakdown of Bronze, Silver, Gold, and Platinum tiers?',
      'Pricing info is available at /subscribe. I can explain the differences between our Bronze, Silver, Gold, and Platinum plans.',
    ],
    suggestions: ['Bronze Plan', 'Silver Plan', 'Gold Plan', 'Platinum Plan'],
  },
  {
    patterns: ['account', 'profile', 'settings', 'password', 'security', '2fa', 'two factor', 'delete account'],
    responses: [
      'I can help with account settings. What do you need \u2014 update profile, change password, enable 2FA, or something else?',
      'Account management is straightforward in AzFIT. Are you looking to update settings, change security options, or manage your subscription?',
      'Let me help with your account. Profile updates, password changes, security settings \u2014 what do you need?',
    ],
    suggestions: ['Update Profile', 'Change Password', 'Security Settings', 'Manage Subscription'],
  },
];

// ── FALLBACK RESPONSES ─────────────────────────────────────────

const FALLBACK_WORKOUT = 'I can help with workouts! What would you like to do \u2014 create a program, learn about an exercise, log a session, or get training advice?';
const FALLBACK_NUTRITION = 'I can help with nutrition! Ask about meal planning, macro calculations, food logging, or supplement guidance.';
const FALLBACK_CLIENT = 'I can help with client management! Need to schedule sessions, update programs, log progress, or handle billing?';
const FALLBACK_GENERAL = 'I\'m AzFIT\'s AI assistant. I can help with workouts, nutrition, client management, or platform questions. What would you like to explore?';

// ═══════════════════════════════════════════════════════════════
// Edge Case Handlers
// ═══════════════════════════════════════════════════════════════

function checkCrisisKeywords(input: string): string | null {
  const lower = input.toLowerCase();
  const crisisKeywords = [
    'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die',
    'self-harm', 'self harm', 'cutting myself', 'hurt myself',
  ];
  if (crisisKeywords.some((kw) => lower.includes(kw))) {
    return "I'm not equipped for this. Please contact a crisis helpline or your healthcare provider. For Hong Kong, call 2896 0000 (Suicide Prevention Services) or 2382 0000 (The Samaritans).";
  }
  return null;
}

function checkMedicalKeywords(input: string): string | null {
  const lower = input.toLowerCase();
  const medicalPatterns = [
    'diagnose', 'diagnosis', 'disease', 'medical condition', 'treatment',
    'medication', 'prescription', 'surgery', 'chronic illness',
  ];
  if (medicalPatterns.some((kw) => lower.includes(kw))) {
    return "I can't provide medical advice. Please consult a healthcare professional. I can help with general fitness and nutrition guidance instead!";
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
// Matching & Selection Logic
// ═══════════════════════════════════════════════════════════════

function findBestResponseSet(input: string, sets: ResponseSet[]): ResponseSet | null {
  const lower = input.toLowerCase();
  let bestMatch: ResponseSet | null = null;
  let bestScore = 0;

  for (const set of sets) {
    let score = 0;
    for (const pattern of set.patterns) {
      if (lower.includes(pattern)) {
        score += pattern.split(/\s+/).length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = set;
    }
  }

  return bestScore >= 1 ? bestMatch : null;
}

function pickRandomResponse(responses: string[]): string {
  return responses[Math.floor(Math.random() * responses.length)];
}

function buildCrossContextBridge(
  primaryContext: ChatContext,
  secondary: ChatContext[]
): { response: string; suggestions: string[] } {
  const bridgeTemplates: Record<string, Record<string, string>> = {
    nutrition: {
      workout: "Here's your nutrition info. Since you're thinking about training \u2014 would you also like pre/post-workout meal suggestions?",
    },
    workout: {
      nutrition: "Here's your workout guidance. Would you also like nutrition tips to support this training style?",
    },
    client: {
      workout: "I've got your client management answer. Would you also like help designing workouts for this client?",
      nutrition: "Here's the client info you need. Would you also like to discuss nutrition planning for this client?",
    },
    general: {
      workout: "Here's the info you need. Would you also like to explore workout programs?",
      nutrition: "Got it! Would you also like to dive into nutrition planning?",
      client: "Here's what you're looking for. Interested in client management features too?",
    },
  };

  const firstSecondary = secondary[0];
  const template = bridgeTemplates[primaryContext]?.[firstSecondary];

  if (template) {
    return {
      response: template,
      suggestions: [`Explore ${capitalize(firstSecondary)}`, 'Stay on Current Topic', 'Show Me Both'],
    };
  }

  // Generic bridge
  return {
    response: `I found information about ${primaryContext}. Would you also like to explore ${firstSecondary}?`,
    suggestions: [`Yes, explore ${capitalize(firstSecondary)}`, 'No thanks', 'Show both topics'],
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ═══════════════════════════════════════════════════════════════
// Main Export: generateResponse
// ═══════════════════════════════════════════════════════════════

export function generateResponse(
  intent: IntentResult,
  input: string,
  _pageContext: PageContext,
  _userType: string
): { response: string; suggestions: string[] } {
  // ── Edge cases ───────────────────────────────────────────────
  const crisisResponse = checkCrisisKeywords(input);
  if (crisisResponse) {
    return {
      response: crisisResponse,
      suggestions: ['Contact Support', 'Platform Help'],
    };
  }

  const medicalResponse = checkMedicalKeywords(input);
  if (medicalResponse) {
    return {
      response: medicalResponse,
      suggestions: ['General Fitness Help', 'Nutrition Guidance', 'Platform Features'],
    };
  }

  // ── Off-topic ────────────────────────────────────────────────
  if (intent.action === 'off_topic_redirect') {
    return {
      response: "I'm AzFIT's fitness assistant, so I can't help with that. But I can help you with workouts, nutrition, client management, or platform questions! What would you like to explore?",
      suggestions: ['Workouts', 'Nutrition', 'Client Management', 'Platform Help'],
    };
  }

  // ── Cross-context bridge ─────────────────────────────────────
  if (intent.action === 'cross_context_bridge' && intent.secondaryContexts && intent.secondaryContexts.length > 0) {
    return buildCrossContextBridge(intent.context, intent.secondaryContexts);
  }

  // ── Direct route or route_with_confirmation ──────────────────
  const responseDB = getResponseDB(intent.context);
  const matchedSet = findBestResponseSet(input, responseDB);

  if (matchedSet) {
    return {
      response: pickRandomResponse(matchedSet.responses),
      suggestions: matchedSet.suggestions,
    };
  }

  // ── Fallback by context ──────────────────────────────────────
  const fallback = getFallback(intent.context);
  return {
    response: fallback,
    suggestions: getDefaultSuggestions(intent.context),
  };
}

function getResponseDB(context: ChatContext): ResponseSet[] {
  switch (context) {
    case 'workout': return WORKOUT_RESPONSES;
    case 'nutrition': return NUTRITION_RESPONSES;
    case 'client': return CLIENT_RESPONSES;
    case 'general': return GENERAL_RESPONSES;
  }
}

function getFallback(context: ChatContext): string {
  switch (context) {
    case 'workout': return FALLBACK_WORKOUT;
    case 'nutrition': return FALLBACK_NUTRITION;
    case 'client': return FALLBACK_CLIENT;
    case 'general': return FALLBACK_GENERAL;
  }
}

function getDefaultSuggestions(context: ChatContext): string[] {
  switch (context) {
    case 'workout':
      return ['Create Workout', 'Exercise Info', 'Log Session', 'Training Tips'];
    case 'nutrition':
      return ['Calculate Macros', 'Meal Plan', 'Log Meal', 'Smart Swap'];
    case 'client':
      return ['Schedule Session', 'Client Info', 'Log Progress', 'Billing'];
    case 'general':
      return ['Platform Help', 'Certifications', 'Business Advice', 'Getting Started'];
  }
}
