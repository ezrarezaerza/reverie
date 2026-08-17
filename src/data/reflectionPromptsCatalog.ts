export interface ReflectionPrompt {
  id: string;
  theme: 'sensory' | 'mundane' | 'time_dilation' | 'gratitude' | 'unexpected';
  promptText: string;
  subtext: string;
}

export const EVENING_REFLECTION_PROMPTS: ReflectionPrompt[] = [
  {
    id: 'ref-01',
    theme: 'mundane',
    promptText: 'What was one tiny, ordinary detail that felt strangely quiet today?',
    subtext: 'A patch of sunlight on the rug, the hum of a refrigerator, a kettle whistle.'
  },
  {
    id: 'ref-02',
    theme: 'time_dilation',
    promptText: 'Which 10 minutes of today felt the slowest, and why?',
    subtext: 'Was it boredom, wonder, physical effort, or waiting for something?'
  },
  {
    id: 'ref-03',
    theme: 'sensory',
    promptText: 'What texture, temperature, or breeze surprised your skin today?',
    subtext: 'The sudden cold of door handles, humid evening air, warm ceramic.'
  },
  {
    id: 'ref-04',
    theme: 'unexpected',
    promptText: 'What is something you saw today that no one else around you noticed?',
    subtext: 'A pigeon nesting in an awning, an odd reflection in glass, a bent street sign.'
  },
  {
    id: 'ref-05',
    theme: 'gratitude',
    promptText: 'What is an unhurried moment you enjoyed without feeling guilty?',
    subtext: 'Sitting on the porch, staring out the window, listening to rain.'
  },
  {
    id: 'ref-06',
    theme: 'mundane',
    promptText: 'If you had to draw one single physical object from today from memory, what would it be?',
    subtext: 'Describe its exact curves, scratches, and current location.'
  },
  {
    id: 'ref-07',
    theme: 'time_dilation',
    promptText: 'Did you break routine even once today? How did your brain register it?',
    subtext: 'A different brand of coffee, a varied route, eating with someone new.'
  },
  {
    id: 'ref-08',
    theme: 'sensory',
    promptText: 'What was the most pleasant sound you heard in the last 12 hours?',
    subtext: 'Pages turning, leaves scraping on asphalt, distant train rumble, laughter.'
  }
];

export const TIME_PERCEPTION_SCIENCE = [
  {
    title: "Autobiographical Memory Compression",
    subtitle: "Why childhood felt long and adulthood flies",
    description: "The adult brain processes familiar routines with minimal neural encoding. When everyday experiences repeat without novelty, the brain dumps the redundant data. In retrospect, a month feels like a weekend because there are few unique memory flags."
  },
  {
    title: "The Proportional Theory of Time",
    subtitle: "Paul Janet's temporal ratio",
    description: "At age 10, a single year represents 10% of your entire existence. At age 50, a year is just 2%. Micro-novelties artificially inject high-salience perceptual markers into working memory, resetting this ratio."
  },
  {
    title: "Sensory Anchoring vs. Screen Trance",
    subtitle: "Reclaiming physical somatosensory texture",
    description: "Rapid digital media feeds our eyes with rapid low-effort stimuli without spatial or physical coordinates. Writing with tactile blue ink on paper and engaging touch, scent, and temperature anchors the memory in multi-sensory coordinates."
  }
];
