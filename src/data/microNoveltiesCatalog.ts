import { MicroNovelty } from '../types';

export const MICRO_NOVELTIES_CATALOG: MicroNovelty[] = [
  // ==========================================
  // DOMAIN 1: SENSORY AWAKENING (10 Prompts)
  // ==========================================
  {
    id: 'nov-01',
    category: 'sensory',
    title: 'The Silent Scent Time Machine',
    tagline: 'Awaken the direct pathway to episodic memory',
    instruction: 'Go to your kitchen spice rack or garden. Close your eyes, pick a spice or leaf you rarely touch (clove, cardamom, rosemary, or dried orange peel), inhale deeply for 10 seconds, and observe what early memory surfaces.',
    estimatedMinutes: 3,
    difficulty: 'gentle',
    sensoryFocus: ['scent', 'touch'],
    whyItSlowsTime: 'Olfactory signals bypass the thalamus and wire directly into the amygdala and hippocampus, stimulating vivid associative recall and anchoring the present moment.',
    iconType: 'feather'
  },
  {
    id: 'nov-02',
    category: 'sensory',
    title: 'The 5-Texture Tactile Hunt',
    tagline: 'Re-engage physical touch receptors',
    instruction: 'Without leaving your room, locate and touch 5 wildly different surfaces (e.g. cold raw glass, coarse denim, polished wood grain, rough wool, cold stainless steel). Feel each with your eyes shut for 10 seconds.',
    estimatedMinutes: 4,
    difficulty: 'gentle',
    sensoryFocus: ['touch'],
    whyItSlowsTime: 'Tactile discrimination requires somatosensory cortex activation, pulling attention away from internal anxious rumination into tactile reality.',
    iconType: 'feather'
  },
  {
    id: 'nov-03',
    category: 'sensory',
    title: 'Sound Horizon Scanning',
    tagline: 'Isolate the 4 quietest layers of ambient noise',
    instruction: 'Close your eyes for 60 seconds wherever you are. Identify the closest sound, a medium-distance sound, the furthest distant background rumble, and your own heartbeat/breath.',
    estimatedMinutes: 2,
    difficulty: 'gentle',
    sensoryFocus: ['sound'],
    whyItSlowsTime: 'Auditory depth filtering stretches attention across physical space, widening the brain’s temporal processing window.',
    iconType: 'ear'
  },
  {
    id: 'nov-04',
    category: 'sensory',
    title: 'Thermal Contrast Shock',
    tagline: 'Reset autonomic nervous system arousal',
    instruction: 'Run cold tap water over your wrists and inner forearms for 20 seconds, then immediately wrap your hands around a warm cup or warm towel. Note the rapid temperature migration.',
    estimatedMinutes: 2,
    difficulty: 'gentle',
    sensoryFocus: ['touch'],
    whyItSlowsTime: 'Sudden thermoceptor stimulation triggers the mammalian dive reflex and parasympathetic tone, arresting runaway cognitive rushing.',
    iconType: 'sparkle'
  },
  {
    id: 'nov-05',
    category: 'sensory',
    title: 'Blind Taste Isolation',
    tagline: 'Separate texture from flavor expectations',
    instruction: 'Take a small bite of fruit, chocolate, or bread with your eyes shut and nose pinched for 5 seconds. Release your nose and observe the explosive arrival of retro-nasal aromas.',
    estimatedMinutes: 3,
    difficulty: 'playful',
    sensoryFocus: ['taste', 'scent'],
    whyItSlowsTime: 'Decoupling gustatory sensation from visual expectation forces deep sensory decoding, prolonging the perceived passage of time.',
    iconType: 'cup'
  },
  {
    id: 'nov-06',
    category: 'sensory',
    title: 'The Resonance Hum',
    tagline: 'Feel sound physically through bone conduction',
    instruction: 'Close your lips and produce a low, steady humming tone on a single exhale for 15 seconds. Place one palm against your chest and one against your throat to feel the acoustic vibrations.',
    estimatedMinutes: 2,
    difficulty: 'gentle',
    sensoryFocus: ['sound', 'touch'],
    whyItSlowsTime: 'Vagal nerve stimulation via vocal cord vibration induces immediate heart rate deceleration and heightened bodily presence.',
    iconType: 'ear'
  },
  {
    id: 'nov-07',
    category: 'sensory',
    title: 'Petrichor & Fresh Air Inhale',
    tagline: 'Savor damp earth and outside air currents',
    instruction: 'Step outside or open a window fully. Take three slow, expansive breaths through your nose, identifying moisture, vegetation, asphalt, or cool night air.',
    estimatedMinutes: 3,
    difficulty: 'gentle',
    sensoryFocus: ['scent'],
    whyItSlowsTime: 'Volatile organic compounds from plants and damp soil trigger deep evolutionary relaxation responses in the limbic system.',
    iconType: 'feather'
  },
  {
    id: 'nov-08',
    category: 'sensory',
    title: 'The Micro-Detail Tactile Scan',
    tagline: 'Feel the invisible topography of your fingertip',
    instruction: 'Gently glide the index finger of one hand over the palm of your opposite hand with feather-light pressure for 45 seconds, mapping every ridge and fingerprint line.',
    estimatedMinutes: 2,
    difficulty: 'gentle',
    sensoryFocus: ['touch'],
    whyItSlowsTime: 'Low-threshold mechanoreceptors activate somatic neural maps that normally go unnoticed, stretching immediate temporal awareness.',
    iconType: 'feather'
  },
  {
    id: 'nov-09',
    category: 'sensory',
    title: 'Pure Pitch Listening',
    tagline: 'Listen to a single bell or chime until absolute silence',
    instruction: 'Tap a metal spoon against a glass cup, ring a chime, or strike a singing bowl. Follow the fading ring until you are 100% certain sound has completely ceased.',
    estimatedMinutes: 2,
    difficulty: 'gentle',
    sensoryFocus: ['sound'],
    whyItSlowsTime: 'Tracking the decay curve of an acoustic tone forces maximum auditory threshold sensitivity, creating a micro-pocket of mental stillness.',
    iconType: 'ear'
  },
  {
    id: 'nov-10',
    category: 'sensory',
    title: 'The Citrus Peel Squeeze',
    tagline: 'Release aromatic essential oils onto your skin',
    instruction: 'Peel an orange, lemon, or lime. Fold a piece of the peel and squeeze until the microscopic oil mist bursts into the air. Rub the oil onto your palms and breathe in.',
    estimatedMinutes: 3,
    difficulty: 'playful',
    sensoryFocus: ['scent', 'touch'],
    whyItSlowsTime: 'Limonene terpenes produce immediate neurochemical alertness without digital screen fatigue.',
    iconType: 'sparkle'
  },

  // ==========================================
  // DOMAIN 2: ROUTINE BREAKERS & SPACE (10 Prompts)
  // ==========================================
  {
    id: 'nov-11',
    category: 'routine_breaker',
    title: 'The Uncharted Turn',
    tagline: 'Step outside the automated commute groove',
    instruction: 'On your walk, commute, or daily errand today, turn down a street, alleyway, or path you have never set foot on before. Walk at half your usual speed for just two blocks.',
    estimatedMinutes: 5,
    difficulty: 'gentle',
    sensoryFocus: ['sight', 'sound'],
    whyItSlowsTime: 'When walking familiar routes, the hippocampus enters auto-pilot. Navigating novel visual geometry forces your brain to generate fresh spatial landmarks, stretching perceived duration.',
    iconType: 'compass'
  },
  {
    id: 'nov-12',
    category: 'routine_breaker',
    title: 'The Non-Dominant Hand Meal',
    tagline: 'Break unconscious motor muscle memory',
    instruction: 'Eat the first 10 bites of your lunch or dinner (or hold your warm tea mug) using only your non-dominant hand. Notice the awkward precision required.',
    estimatedMinutes: 5,
    difficulty: 'playful',
    sensoryFocus: ['touch', 'taste'],
    whyItSlowsTime: 'Motor cortex friction disrupts mindless consumption, instantly transforming automated habits into conscious somatic focus.',
    iconType: 'cup'
  },
  {
    id: 'nov-13',
    category: 'routine_breaker',
    title: 'The Shifted Perch',
    tagline: 'Change your domestic viewpoint',
    instruction: 'Sit on the floor, on a backwards chair, or in a corner of your home where you never normally sit. Spend 3 minutes looking at familiar furniture from this new angle.',
    estimatedMinutes: 3,
    difficulty: 'gentle',
    sensoryFocus: ['sight'],
    whyItSlowsTime: 'Altering retinal elevation and angle of vision breaks the brain’s predictive spatial coding model, making home feel subtly unfamiliar and fresh.',
    iconType: 'compass'
  },
  {
    id: 'nov-14',
    category: 'routine_breaker',
    title: 'Reverse Walking Sequence',
    tagline: 'Walk backward safely in a controlled room',
    instruction: 'In a clear hallway or living room, take 20 slow, deliberate steps backward. Feel your toes touch the ground before your heels in reversed biomechanics.',
    estimatedMinutes: 3,
    difficulty: 'playful',
    sensoryFocus: ['touch', 'sight'],
    whyItSlowsTime: 'Retro-walking demands total cerebellar engagement and proprioception, temporarily silencing default mode network daydreaming.',
    iconType: 'compass'
  },
  {
    id: 'nov-15',
    category: 'routine_breaker',
    title: 'The Watch Switch',
    tagline: 'Create a tactile reminder on your wrist',
    instruction: 'Move your wristwatch or bracelet to your opposite wrist for the remainder of the day. Notice the tiny physical surprise every time you check the time.',
    estimatedMinutes: 1,
    difficulty: 'gentle',
    sensoryFocus: ['touch'],
    whyItSlowsTime: 'Each habitual glance meets friction, transforming an automated reflex into a conscious pause of time awareness.',
    iconType: 'clock'
  },
  {
    id: 'nov-16',
    category: 'routine_breaker',
    title: 'The Grayscale Evening',
    tagline: 'Strip out synthetic dopamine hues',
    instruction: 'Set your phone display to grayscale (monochrome) for 30 minutes before bed. Notice how quickly the urge to endlessly scroll dissolves without saturated colors.',
    estimatedMinutes: 5,
    difficulty: 'gentle',
    sensoryFocus: ['sight'],
    whyItSlowsTime: 'Color stimulates hyper-reactive reward pathways; removing it restores normal cognitive pacing and circadian winding down.',
    iconType: 'eye'
  },
  {
    id: 'nov-17',
    category: 'routine_breaker',
    title: 'The Slow-Motion Door Threshold',
    tagline: 'Pause at the boundary between two rooms',
    instruction: 'Whenever you pass through a doorway today, stop on the threshold for 3 full seconds. Look at the new room before stepping across.',
    estimatedMinutes: 2,
    difficulty: 'gentle',
    sensoryFocus: ['sight', 'touch'],
    whyItSlowsTime: 'Psychologists call this the "Doorway Effect" where the brain resets working memory; pausing on the threshold anchors cognitive continuity.',
    iconType: 'compass'
  },
  {
    id: 'nov-18',
    category: 'routine_breaker',
    title: 'The Analog Currency Exchange',
    tagline: 'Use physical paper money for one purchase',
    instruction: 'Pay for your coffee, groceries, or ticket with physical bills and coins. Feel the paper grain and listen to the clink of metal change.',
    estimatedMinutes: 3,
    difficulty: 'playful',
    sensoryFocus: ['touch', 'sound'],
    whyItSlowsTime: 'Physical cash transactions introduce tactile friction into what is normally an imperceptible digital tap, anchoring financial value and time.',
    iconType: 'sparkle'
  },
  {
    id: 'nov-19',
    category: 'routine_breaker',
    title: 'The Single-Task Dishwash Ritual',
    tagline: 'Wash one bowl with ceremonial care',
    instruction: 'Wash one cup, plate, or fork with warm water and soap with zero podcast, music, or rushing. Feel the warmth, slick bubbles, and rinse clean squeak.',
    estimatedMinutes: 3,
    difficulty: 'gentle',
    sensoryFocus: ['touch', 'sound'],
    whyItSlowsTime: 'Treating a chore as a physical sensory meditation turns a mundane obligation into a rich episodic memory marker.',
    iconType: 'cup'
  },
  {
    id: 'nov-20',
    category: 'routine_breaker',
    title: 'The Unfamiliar Aisle Wander',
    tagline: 'Explore an exotic market shelf you normally skip',
    instruction: 'In any grocery store or library, spend 3 minutes browsing an aisle you have never visited (e.g. fermented goods, craft paper, or poetry). Read three labels carefully.',
    estimatedMinutes: 4,
    difficulty: 'playful',
    sensoryFocus: ['sight', 'serendipity'],
    whyItSlowsTime: 'Exposing semantic networks to foreign vocabulary and visuals breaks consumer autopilot, widening daily memory bandwidth.',
    iconType: 'compass'
  },

  // ==========================================
  // DOMAIN 3: CURIOSITY & OBSERVATION (10 Prompts)
  // ==========================================
  {
    id: 'nov-21',
    category: 'curiosity',
    title: 'Cloud Velocity Observation',
    tagline: 'Observe the slow architecture of the sky',
    instruction: 'Step outdoors or look out a large window. Pick a single high-altitude cloud or tree branch silhouette. Watch it continuously without checking your screen for 90 full seconds.',
    estimatedMinutes: 2,
    difficulty: 'gentle',
    sensoryFocus: ['sight'],
    whyItSlowsTime: 'Tracking slow, continuous natural motion resets saccadic eye micro-movements caused by fast digital switching, expanding subjective time dilation.',
    iconType: 'eye'
  },
  {
    id: 'nov-22',
    category: 'curiosity',
    title: 'The Foreign Cadence',
    tagline: 'Listen to speech without linguistic parsing',
    instruction: 'Listen to 1 whole song or a 2-minute spoken clip in a language you have never studied. Do not look up translations; focus entirely on rhythm, vocal pitch, and acoustic textures.',
    estimatedMinutes: 4,
    difficulty: 'gentle',
    sensoryFocus: ['sound'],
    whyItSlowsTime: 'Because your semantic decoding centers cannot categorize the words, auditory cortex processes sound as raw music, increasing sensory data capture.',
    iconType: 'ear'
  },
  {
    id: 'nov-23',
    category: 'curiosity',
    title: 'The 90-Second Creature Watch',
    tagline: 'Track the micro-movements of animal life',
    instruction: 'Find a bird, squirrel, insect, or domestic pet. Watch it intently for 90 seconds without looking away. Try to anticipate its next hop, flutter, or turn.',
    estimatedMinutes: 2,
    difficulty: 'gentle',
    sensoryFocus: ['sight'],
    whyItSlowsTime: 'Observing non-human behavior synchronizes your visual tracking systems with natural biological rhythms rather than clock time.',
    iconType: 'eye'
  },
  {
    id: 'nov-24',
    category: 'curiosity',
    title: 'Shadow Geometry Mapping',
    tagline: 'Trace the light cast by afternoon sun',
    instruction: 'Look around your room and find where the longest window shadow lands right now. Notice its razor-sharp or diffused edges and the exact geometric angle.',
    estimatedMinutes: 2,
    difficulty: 'gentle',
    sensoryFocus: ['sight'],
    whyItSlowsTime: 'Shadows are nature’s sundial; noticing them reconnects your circadian neurology to planetary motion and solar progression.',
    iconType: 'eye'
  },
  {
    id: 'nov-25',
    category: 'curiosity',
    title: 'Rooftop Architectural Scan',
    tagline: 'Look up above the commercial eye line',
    instruction: 'Look at the top two floors, cornices, or roofs of buildings you pass today. Look for brickwork, vintage antennas, weather vanes, or window lintels normally overlooked.',
    estimatedMinutes: 3,
    difficulty: 'gentle',
    sensoryFocus: ['sight'],
    whyItSlowsTime: 'Adult gaze is almost exclusively locked horizontally or downward toward ground and screens; looking up expands vertical peripheral vision.',
    iconType: 'compass'
  },
  {
    id: 'nov-26',
    category: 'curiosity',
    title: 'The Hand Palm Cartography',
    tagline: 'Inspect the geography of your own skin',
    instruction: 'Examine the palm of your non-dominant hand under good lighting for two unhurried minutes. Locate a freckle, scar, or crease intersection you have never inspected.',
    estimatedMinutes: 2,
    difficulty: 'gentle',
    sensoryFocus: ['sight', 'touch'],
    whyItSlowsTime: 'Close micro-examination of self-biology fosters intimate somatic grounding, halting abstract future anxiety.',
    iconType: 'sparkle'
  },
  {
    id: 'nov-27',
    category: 'curiosity',
    title: 'The Overheard Fragment',
    tagline: 'Capture a verbatim snippet of public dialogue',
    instruction: 'Listen to public conversation around you until you catch one interesting, funny, or poetic sentence spoken by a stranger. Inscribe it mentally or in your notes.',
    estimatedMinutes: 3,
    difficulty: 'playful',
    sensoryFocus: ['sound', 'serendipity'],
    whyItSlowsTime: 'Capturing serendipitous auditory fragments creates distinct narrative memory pins that demarcate this day from all others.',
    iconType: 'ear'
  },
  {
    id: 'nov-28',
    category: 'curiosity',
    title: 'The 30-Second Blind Sketch',
    tagline: 'Draw without lifting your pen from paper',
    instruction: 'Take a pen and scrap paper. Look at any object on your table (mug, key, plant) and draw its outline in 30 seconds without looking down at your paper.',
    estimatedMinutes: 2,
    difficulty: 'playful',
    sensoryFocus: ['sight', 'touch'],
    whyItSlowsTime: 'Blind contour drawing forces direct hand-eye motor synchronization, bypassing inner critic filters.',
    iconType: 'feather'
  },
  {
    id: 'nov-29',
    category: 'curiosity',
    title: 'Object Archeology Placard',
    tagline: 'Study the scratches on your oldest possession',
    instruction: 'Pick up an everyday object that you have owned for years. Study its dents, wear marks, and faded paint as if it were an ancient artifact in a history museum.',
    estimatedMinutes: 3,
    difficulty: 'gentle',
    sensoryFocus: ['sight', 'touch'],
    whyItSlowsTime: 'Viewing familiar objects through historical detachment activates deep nostalgia and temporal context appreciation.',
    iconType: 'sparkle'
  },
  {
    id: 'nov-30',
    category: 'curiosity',
    title: 'The Word of the Day Inscription',
    tagline: 'Introduce a rare word into your mental vocabulary',
    instruction: 'Open a physical dictionary or encyclopedia to a random page. Find one evocative word you have never spoken (e.g. Apricity, Petrichor, Sonder) and write it down.',
    estimatedMinutes: 3,
    difficulty: 'gentle',
    sensoryFocus: ['serendipity', 'sight'],
    whyItSlowsTime: 'Acquiring novel linguistic labels creates new cognitive categories, enriching the brain’s resolution for future sensory encoding.',
    iconType: 'feather'
  },

  // ==========================================
  // DOMAIN 4: MINDFUL STILLNESS & RITUALS (10 Prompts)
  // ==========================================
  {
    id: 'nov-31',
    category: 'stillness',
    title: 'The Unaccompanied Warm Drink',
    tagline: 'Zero screens, zero audio, only steam',
    instruction: 'Prepare a cup of tea, coffee, or warm water. Drink the entire cup without looking at a phone, book, computer, or talking. Focus solely on the temperature and aroma.',
    estimatedMinutes: 8,
    difficulty: 'deep',
    sensoryFocus: ['taste', 'scent', 'touch'],
    whyItSlowsTime: 'Mono-tasking with heat and hydration prevents cognitive fragmenting, restoring natural circadian rhythm pacing.',
    iconType: 'cup'
  },
  {
    id: 'nov-32',
    category: 'stillness',
    title: 'The 3-Sentence Micro-Haiku',
    tagline: 'Capture one micro-scene in analog words',
    instruction: 'Look at whatever object is directly to the left of your elbow right now. Write down exactly 3 lines describing its color, its shadow, and its purpose.',
    estimatedMinutes: 3,
    difficulty: 'playful',
    sensoryFocus: ['sight', 'serendipity'],
    whyItSlowsTime: 'Translating visual minutiae into descriptive vocabulary deepens semantic processing and crystallizes the mundane into memory.',
    iconType: 'feather'
  },
  {
    id: 'nov-33',
    category: 'stillness',
    title: 'Dusk Twilight Immersion',
    tagline: 'Sit in fading daylight before turning on lamps',
    instruction: 'At sunset, turn off all interior electric lights in one room. Sit quietly for 6 minutes as natural dusk deepens and your pupils slowly dilate.',
    estimatedMinutes: 6,
    difficulty: 'deep',
    sensoryFocus: ['sight', 'touch'],
    whyItSlowsTime: 'Witnessing the subtle, non-linear decline of natural light recalibrates retinal photoreceptors to natural twilight duration.',
    iconType: 'eye'
  },
  {
    id: 'nov-34',
    category: 'stillness',
    title: 'The Floor Decompression',
    tagline: 'Lay flat on the floor with arms open',
    instruction: 'Lie flat on your back on a rug or wood floor with arms spread wide for 3 uninterrupted minutes. Feel your spine decompress against the solid earth.',
    estimatedMinutes: 3,
    difficulty: 'gentle',
    sensoryFocus: ['touch'],
    whyItSlowsTime: 'Zero-pressure somatic postures trigger profound muscular release and reduce mental vigilance arousal levels.',
    iconType: 'sparkle'
  },
  {
    id: 'nov-35',
    category: 'stillness',
    title: 'Single Flame Meditation',
    tagline: 'Watch a match or candle settle into silence',
    instruction: 'Light a candle or match in a dim room. Watch the golden teardrop flame flicker, dance, and settle into stillness for 2 minutes without speaking.',
    estimatedMinutes: 3,
    difficulty: 'gentle',
    sensoryFocus: ['sight'],
    whyItSlowsTime: 'Flickering firelight has comforted human primates for millennia, inducing alpha brainwave synchronization and serene focus.',
    iconType: 'sparkle'
  },
  {
    id: 'nov-36',
    category: 'stillness',
    title: 'The 4-7-8 Ocean Breath',
    tagline: 'Four rounds of elongated rhythmic respiration',
    instruction: 'Inhale through your nose for 4 counts, hold gently for 7 counts, and exhale with a whooshing sound for 8 counts. Repeat 4 full cycles.',
    estimatedMinutes: 3,
    difficulty: 'gentle',
    sensoryFocus: ['sound', 'touch'],
    whyItSlowsTime: 'Extending exhalations stimulates the vagus nerve, rapidly lowering arterial blood pressure and lengthening internal time perception.',
    iconType: 'sparkle'
  },
  {
    id: 'nov-37',
    category: 'stillness',
    title: 'Micro-Paper Origami Fold',
    tagline: 'Fold a tiny paper square into symmetry',
    instruction: 'Take a small scrap of paper (or receipt). Fold it four times with crisp, deliberate fingernail creases into the smallest neat geometric square you can manage.',
    estimatedMinutes: 2,
    difficulty: 'gentle',
    sensoryFocus: ['touch'],
    whyItSlowsTime: 'Tactile precision origami shifts cortical activity from broad worry to fine motor control, producing instant mental tranquility.',
    iconType: 'feather'
  },
  {
    id: 'nov-38',
    category: 'stillness',
    title: 'The Aloud Page Reading',
    tagline: 'Feel the acoustic resonance of written prose',
    instruction: 'Pick any book on your shelf. Open to a random page and read 1 full page out loud to the empty room, enunciating every vowel and cadence.',
    estimatedMinutes: 3,
    difficulty: 'gentle',
    sensoryFocus: ['sound', 'sight'],
    whyItSlowsTime: 'Vocalizing written language activates both auditory and motor speech regions simultaneously, doubling memory trace retention.',
    iconType: 'feather'
  },
  {
    id: 'nov-39',
    category: 'stillness',
    title: 'The Silent Water Cascade',
    tagline: 'Drink a full glass of cold water in one continuous flow',
    instruction: 'Fill a tall glass with cold water. Drink the entire glass slowly in one continuous series of gentle swallows, feeling the chill travel down your esophagus.',
    estimatedMinutes: 2,
    difficulty: 'gentle',
    sensoryFocus: ['taste', 'touch'],
    whyItSlowsTime: 'Internal visceral thermo-receptors provide potent somatic cues that ground the mind firmly inside physical body reality.',
    iconType: 'cup'
  },
  {
    id: 'nov-40',
    category: 'stillness',
    title: 'Morning Retrospective Recall',
    tagline: 'Rewind the tape of your first 15 minutes of waking',
    instruction: 'Close your eyes before sleep. Replay the first 15 minutes of your morning in chronological photographic detail: first step, bathroom light, first sip.',
    estimatedMinutes: 3,
    difficulty: 'gentle',
    sensoryFocus: ['serendipity'],
    whyItSlowsTime: 'Episodic memory replay consolidates daily events into long-term hippocampal storage, countering temporal amnesia.',
    iconType: 'clock'
  },

  // ==========================================
  // DOMAIN 5: NATURE & SOCIAL CONNECTION (10 Prompts)
  // ==========================================
  {
    id: 'nov-41',
    category: 'nature',
    title: 'Pebble or Leaf Pocket Talisman',
    tagline: 'Ground yourself with a natural keepsake',
    instruction: 'Find an ordinary fallen leaf, unusual small pebble, or seed pod on the ground outside. Pick it up, examine its imperfections closely, and carry it in your pocket all day as a tactile reminder.',
    estimatedMinutes: 3,
    difficulty: 'gentle',
    sensoryFocus: ['touch', 'sight'],
    whyItSlowsTime: 'Carrying a physical novel object in your pocket creates recurring micro-interruptions to automated thought loops whenever you reach into your pocket.',
    iconType: 'sparkle'
  },
  {
    id: 'nov-42',
    category: 'connection',
    title: 'The Granular Observation Compliment',
    tagline: 'Notice something invisible to others',
    instruction: 'Tell someone (colleague, barista, family member, neighbor) a hyper-specific observation about their craft, tone, or effort (e.g. "The way you organized those boxes is satisfyingly neat").',
    estimatedMinutes: 2,
    difficulty: 'playful',
    sensoryFocus: ['serendipity', 'sight'],
    whyItSlowsTime: 'Social resonance increases oxytocin and emotional salience, generating durable episodic memory anchors.',
    iconType: 'heart'
  },
  {
    id: 'nov-43',
    category: 'nature',
    title: 'Barefoot Grounding Contact',
    tagline: 'Place bare soles against grass, rug, or stone',
    instruction: 'Remove shoes and socks. Stand barefoot on natural grass, cool tile, or textured earth for 2 minutes, noticing the exact points where your weight rests.',
    estimatedMinutes: 2,
    difficulty: 'gentle',
    sensoryFocus: ['touch'],
    whyItSlowsTime: 'Plantar skin mechanoreceptors send dense sensory feedback streams to the cortex, anchoring spatial orientation.',
    iconType: 'sparkle'
  },
  {
    id: 'nov-44',
    category: 'connection',
    title: 'The Forgotten Memory Postcard Note',
    tagline: 'Send an unprompted 2-sentence note to an old friend',
    instruction: 'Text or email a friend you haven\'t spoken with recently. Mention one funny, hyper-specific past memory you shared together with zero expectation of a long reply.',
    estimatedMinutes: 3,
    difficulty: 'gentle',
    sensoryFocus: ['serendipity'],
    whyItSlowsTime: 'Rekindling shared episodic memories expands your subjective autobiography timeline across years of friendship.',
    iconType: 'heart'
  },
  {
    id: 'nov-45',
    category: 'nature',
    title: 'Tree Bark Texture Rubbing',
    tagline: 'Inspect the deep crevices of tree bark',
    instruction: 'Touch the bark of a mature tree outside. Feel the ridges, moss, and weather grooves with your fingers. Smell your fingertips immediately after.',
    estimatedMinutes: 3,
    difficulty: 'gentle',
    sensoryFocus: ['touch', 'scent'],
    whyItSlowsTime: 'Direct tactile connection with ancient natural organisms awakens biophilia, reducing cortisol and mental agitation.',
    iconType: 'sparkle'
  },
  {
    id: 'nov-46',
    category: 'connection',
    title: 'The Anonymous Goodwill Wish',
    tagline: 'Mentally bless a passing stranger on the street',
    instruction: 'Look at a stranger passing by or waiting in line. Silently wish for them: "May you have an unhurried, safe, and joyful evening" without them knowing.',
    estimatedMinutes: 1,
    difficulty: 'gentle',
    sensoryFocus: ['serendipity'],
    whyItSlowsTime: 'Loving-kindness mental framing switches neurobiology from competitive social comparison to expansive communal belonging.',
    iconType: 'heart'
  },
  {
    id: 'nov-47',
    category: 'nature',
    title: 'Night Sky Star Alignment',
    tagline: 'Spot one steady planet among the stars',
    instruction: 'Step outside after dark. Gaze upward for 3 minutes until you locate one steady celestial body (Jupiter, Venus, or Mars) that shines without flickering.',
    estimatedMinutes: 3,
    difficulty: 'deep',
    sensoryFocus: ['sight'],
    whyItSlowsTime: 'Cosmic scale awe triggers the psychological "overview effect," shrinking everyday anxieties and expanding perceived lifetime perspective.',
    iconType: 'eye'
  },
  {
    id: 'nov-48',
    category: 'connection',
    title: 'The Genuine Gratitude Detail',
    tagline: 'Thank someone for a quiet service they performed',
    instruction: 'When receiving an item or food from a worker or family member, look directly into their eyes, smile warmly, and say thank you with deliberate emphasis on their name or action.',
    estimatedMinutes: 1,
    difficulty: 'gentle',
    sensoryFocus: ['serendipity', 'sight'],
    whyItSlowsTime: 'Eye contact paired with sincere gratitude elevates mutual dopamine and oxytocin, making the moment memorable.',
    iconType: 'heart'
  },
  {
    id: 'nov-49',
    category: 'nature',
    title: 'The Flower Stamen Inspection',
    tagline: 'Peer into the microscopic center of a flower',
    instruction: 'Find a blossom or potted flower. Look right into its center at the pollen grains, stamen, and petal veins as if peering through a magnifying glass.',
    estimatedMinutes: 2,
    difficulty: 'gentle',
    sensoryFocus: ['sight', 'scent'],
    whyItSlowsTime: 'Focusing on intricate natural fractals induces effortless involuntary attention (Attention Restoration Theory).',
    iconType: 'sparkle'
  },
  {
    id: 'nov-50',
    category: 'connection',
    title: 'The Secret Paper Note',
    tagline: 'Leave an uplifting message in a book or coffee shop',
    instruction: 'Write "You are doing much better than you think. Have a gentle day." on a tiny scrap of paper and tuck it into a public library book or bus seat.',
    estimatedMinutes: 3,
    difficulty: 'playful',
    sensoryFocus: ['serendipity', 'touch'],
    whyItSlowsTime: 'Creating a ripple of anonymous serendipity infuses your day with a sense of playful purpose and shared humanity.',
    iconType: 'heart'
  }
];

export const SENSORY_CUE_METADATA: Record<string, { label: string; icon: string; color: string }> = {
  sight: { label: 'Visual Detail', icon: '👁️', color: '#3B6A99' },
  sound: { label: 'Acoustic Note', icon: '🔔', color: '#6A8A5E' },
  scent: { label: 'Aroma & Scent', icon: '🌿', color: '#8A5E78' },
  taste: { label: 'Flavor & Texture', icon: '🍵', color: '#B5743D' },
  touch: { label: 'Tactile Sensation', icon: '🖐️', color: '#4B7B75' },
  serendipity: { label: 'Serendipity / Chance', icon: '✨', color: '#9B5B3E' }
};

export const TIME_PACING_METADATA: Record<string, { label: string; symbol: string; description: string; color: string }> = {
  slow: {
    label: 'Slow & Expansive',
    symbol: '🐢',
    description: 'Minutes felt spacious and memorable. High awareness.',
    color: '#2E6B4E'
  },
  flow: {
    label: 'Gentle Flow',
    symbol: '🍃',
    description: 'Harmonious pace, balanced presence without rushing.',
    color: '#3B738A'
  },
  fleeting: {
    label: 'Fleeting Rush',
    symbol: '⚡',
    description: 'Day slipped through fingers quickly. Routine dominance.',
    color: '#A85A32'
  },
  stillness: {
    label: 'Timeless Stillness',
    symbol: '⏳',
    description: 'Pockets of profound calm where time felt paused.',
    color: '#5C4A78'
  }
};
