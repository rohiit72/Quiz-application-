/**
 * Curated Question Bank for QuizFlow Pro
 * Categories: Web Dev, Science & Tech, General Knowledge, Geography & History, Gaming & Pop Culture
 */
const QUIZ_CATEGORIES = [
  {
    id: 'webdev',
    name: 'Web Dev & JavaScript',
    icon: '💻',
    description: 'DOM, ES6+, Async/Await, CSS Tricks, React & Modern Web Standards',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
  },
  {
    id: 'scitech',
    name: 'Science & AI',
    icon: '🚀',
    description: 'Quantum Physics, Space Exploration, AI Models & Computing Frontiers',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #581c87 0%, #8b5cf6 100%)'
  },
  {
    id: 'general',
    name: 'General Knowledge',
    icon: '🧠',
    description: 'Mind-bending Trivia, World Inventions, Art, Books & Human Records',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #831843 0%, #ec4899 100%)'
  },
  {
    id: 'geography',
    name: 'Geography & History',
    icon: '🌍',
    description: 'Ancient Civilizations, World Capitals, Wonders & Epic Epochs',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)'
  },
  {
    id: 'gaming',
    name: 'Gaming & Pop Culture',
    icon: '🎮',
    description: 'Retro Classics, AAA Blockbusters, Cinema, Lore & Easter Eggs',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #78350f 0%, #f59e0b 100%)'
  }
];

const DEFAULT_QUESTIONS = [
  // ==================== WEB DEV ====================
  {
    id: 'wd_1',
    category: 'webdev',
    difficulty: 'easy',
    question: 'What is the output of the following JavaScript code?',
    codeSnippet: 'console.log(typeof NaN);',
    options: ['"undefined"', '"number"', '"NaN"', '"object"'],
    correctIndex: 1,
    explanation: 'In JavaScript, NaN stands for "Not-a-Number", but its data type according to the IEEE 754 floating-point specification is still "number".'
  },
  {
    id: 'wd_2',
    category: 'webdev',
    difficulty: 'easy',
    question: 'Which CSS property creates a 3D perspective effect for nested transformed elements?',
    options: ['perspective', 'transform-style: preserve-3d', 'backdrop-filter', 'box-shadow'],
    correctIndex: 0,
    explanation: 'The `perspective` property in CSS determines the distance between the z=0 plane and the user to give 3D-positioned elements perspective.'
  },
  {
    id: 'wd_3',
    category: 'webdev',
    difficulty: 'medium',
    question: 'What will this JavaScript snippet evaluate to?',
    codeSnippet: 'console.log([] == ![]);',
    options: ['true', 'false', 'TypeError', 'undefined'],
    correctIndex: 0,
    explanation: '![] is coerced to false. Then [] == false triggers type coercion: both are converted to numbers, resulting in 0 == 0 which is true!'
  },
  {
    id: 'wd_4',
    category: 'webdev',
    difficulty: 'medium',
    question: 'In modern CSS, which pseudo-class allows styling a parent based on whether it contains specific children?',
    options: [':has()', ':parent()', ':contains()', ':within()'],
    correctIndex: 0,
    explanation: 'The `:has()` selector, often known as the "parent selector", selects an element if any of the relative selectors passed into it match.'
  },
  {
    id: 'wd_5',
    category: 'webdev',
    difficulty: 'hard',
    question: 'What will be printed to the console in this asynchronous execution?',
    codeSnippet: 'setTimeout(() => console.log("A"), 0);\nPromise.resolve().then(() => console.log("B"));\nconsole.log("C");',
    options: ['C, B, A', 'C, A, B', 'A, B, C', 'B, C, A'],
    correctIndex: 0,
    explanation: '"C" runs synchronously first. Next, microtasks (Promise resolution) run before macrotasks (setTimeout), logging "B" then "A".'
  },
  {
    id: 'wd_6',
    category: 'webdev',
    difficulty: 'hard',
    question: 'Which HTTP header provides protection against Cross-Site Scripting (XSS) and code injection by restricting content origins?',
    options: ['Content-Security-Policy', 'X-Frame-Options', 'Access-Control-Allow-Origin', 'Strict-Transport-Security'],
    correctIndex: 0,
    explanation: 'Content-Security-Policy (CSP) allows site operators to restrict the resources (JavaScript, CSS, Images) that the browser is allowed to load.'
  },
  {
    id: 'wd_7',
    category: 'webdev',
    difficulty: 'easy',
    question: 'Which HTML5 tag is semantically used to wrap independent, self-contained content like a blog post or news item?',
    options: ['<article>', '<section>', '<aside>', '<div>'],
    correctIndex: 0,
    explanation: 'The `<article>` element represents a complete, self-contained composition in a document, page, application, or site.'
  },
  {
    id: 'wd_8',
    category: 'webdev',
    difficulty: 'medium',
    question: 'What does the JavaScript method `Object.freeze()` do that `Object.seal()` does not?',
    options: [
      'It prevents existing properties from being modified or rewritten',
      'It prevents adding new properties',
      'It removes prototypes from the object',
      'It converts values to immutable strings'
    ],
    correctIndex: 0,
    explanation: '`Object.seal()` allows changing the values of existing writable properties. `Object.freeze()` makes all existing properties read-only as well.'
  },

  // ==================== SCIENCE & AI ====================
  {
    id: 'st_1',
    category: 'scitech',
    difficulty: 'easy',
    question: 'What does the acronym "GPU" stand for in modern computing?',
    options: ['Graphics Processing Unit', 'General Purpose Utility', 'Graphical Program Unit', 'Global Processor Unifier'],
    correctIndex: 0,
    explanation: 'GPU stands for Graphics Processing Unit, specialized for parallel computing, machine learning, and graphics rendering.'
  },
  {
    id: 'st_2',
    category: 'scitech',
    difficulty: 'medium',
    question: 'Which neural network architecture introduced the Self-Attention mechanism that revolutionized LLMs in 2017?',
    options: ['Transformer', 'Convolutional Neural Network (CNN)', 'Recurrent Neural Network (RNN)', 'Boltzmann Machine'],
    correctIndex: 0,
    explanation: 'The Transformer architecture was introduced by Vaswani et al. in the landmark paper "Attention Is All You Need" (2017).'
  },
  {
    id: 'st_3',
    category: 'scitech',
    difficulty: 'easy',
    question: 'What is the speed of light in vacuum approximately?',
    options: ['300,000 km/s', '150,000 km/s', '1,000,000 km/s', '30,000 km/s'],
    correctIndex: 0,
    explanation: 'The speed of light in a vacuum is exactly 299,792,458 meters per second, or approximately 300,000 kilometers per second.'
  },
  {
    id: 'st_4',
    category: 'scitech',
    difficulty: 'hard',
    question: 'In quantum mechanics, what phenomenon describes two particles remaining interconnected such that one instantaneously dictates the state of another regardless of distance?',
    options: ['Quantum Entanglement', 'Quantum Tunneling', 'Superposition', 'Wave-particle Duality'],
    correctIndex: 0,
    explanation: 'Quantum Entanglement occurs when pairs or groups of particles interact in ways such that the quantum state of each particle cannot be described independently.'
  },
  {
    id: 'st_5',
    category: 'scitech',
    difficulty: 'medium',
    question: 'What was the first artificial satellite launched into Earth orbit by humanity in 1957?',
    options: ['Sputnik 1', 'Explorer 1', 'Vostok 1', 'Apollo 11'],
    correctIndex: 0,
    explanation: 'Sputnik 1 was launched into an elliptical low Earth orbit by the Soviet Union on October 4, 1957, inaugurating the Space Age.'
  },
  {
    id: 'st_6',
    category: 'scitech',
    difficulty: 'hard',
    question: 'Which fundamental particle is responsible for giving mass to other elementary particles via its quantum field?',
    options: ['Higgs Boson', 'Top Quark', 'Gluon', 'Tau Neutrino'],
    correctIndex: 0,
    explanation: 'The Higgs Boson is an elementary particle in the Standard Model associated with the Higgs field, discovered at CERN in 2012.'
  },
  {
    id: 'st_7',
    category: 'scitech',
    difficulty: 'easy',
    question: 'What gas makes up the majority of Earth’s atmosphere (roughly 78%)?',
    options: ['Nitrogen', 'Oxygen', 'Carbon Dioxide', 'Argon'],
    correctIndex: 0,
    explanation: 'Earth’s atmosphere is composed of approximately 78% Nitrogen, 21% Oxygen, 0.9% Argon, and trace amounts of other gases.'
  },
  {
    id: 'st_8',
    category: 'scitech',
    difficulty: 'medium',
    question: 'Which computer scientist proposed the famous "Imitation Game" test of machine intelligence in 1950?',
    options: ['Alan Turing', 'John von Neumann', 'Claude Shannon', 'Ada Lovelace'],
    correctIndex: 0,
    explanation: 'Alan Turing introduced the Turing Test in his 1950 paper "Computing Machinery and Intelligence" to address "Can machines think?".'
  },

  // ==================== GENERAL KNOWLEDGE ====================
  {
    id: 'gk_1',
    category: 'general',
    difficulty: 'easy',
    question: 'Which planet in our solar system is colloquially dubbed the "Red Planet"?',
    options: ['Mars', 'Jupiter', 'Venus', 'Mercury'],
    correctIndex: 0,
    explanation: 'Mars appears reddish-orange due to the prevalent iron oxide (rust) on its surface rocks and dust.'
  },
  {
    id: 'gk_2',
    category: 'general',
    difficulty: 'medium',
    question: 'Who painted the masterpiece "The Starry Night" in June 1889 while at the Saint-Paul asylum in Saint-Rémy-de-Provence?',
    options: ['Vincent van Gogh', 'Claude Monet', 'Pablo Picasso', 'Salvador Dalí'],
    correctIndex: 0,
    explanation: 'Vincent van Gogh painted "The Starry Night" depicting the view from his east-facing window just before sunrise.'
  },
  {
    id: 'gk_3',
    category: 'general',
    difficulty: 'easy',
    question: 'What is the rarest naturally occurring blood type in the human population?',
    options: ['AB-Negative', 'O-Negative', 'B-Negative', 'A-Positive'],
    correctIndex: 0,
    explanation: 'AB-negative is found in less than 1% of the world population, making it the rarest of the eight major blood types.'
  },
  {
    id: 'gk_4',
    category: 'general',
    difficulty: 'medium',
    question: 'Which author created the world of Middle-earth, writing "The Hobbit" and "The Lord of the Rings"?',
    options: ['J.R.R. Tolkien', 'C.S. Lewis', 'George R.R. Martin', 'Arthur Conan Doyle'],
    correctIndex: 0,
    explanation: 'John Ronald Reuel Tolkien, an Oxford philologist, created the rich mythology and languages of Middle-earth.'
  },
  {
    id: 'gk_5',
    category: 'general',
    difficulty: 'hard',
    question: 'What is the only letter in the English alphabet that does not appear on the periodic table of elements?',
    options: ['J', 'Q', 'Z', 'X'],
    correctIndex: 0,
    explanation: 'The letter "J" does not appear anywhere on the periodic table. ("Q" appears in temporary systematic names like Ununquadium before official naming, but J has never been used).'
  },
  {
    id: 'gk_6',
    category: 'general',
    difficulty: 'medium',
    question: 'In classical music, Ludwig van Beethoven composed his monumental Ninth Symphony while being:',
    options: ['Completely deaf', 'Imprisoned', 'Blind', 'Living in exile'],
    correctIndex: 0,
    explanation: 'By the time Beethoven composed his Ninth Symphony ("Ode to Joy") in 1824, he had completely lost his hearing.'
  },
  {
    id: 'gk_7',
    category: 'general',
    difficulty: 'hard',
    question: 'What deep oceanic trench contains the deepest known point on Earth, the Challenger Deep?',
    options: ['Mariana Trench', 'Puerto Rico Trench', 'Java Trench', 'Philippine Trench'],
    correctIndex: 0,
    explanation: 'The Challenger Deep is located at the southern end of the Mariana Trench, reaching a depth of nearly 11,000 meters (36,000 feet).'
  },
  {
    id: 'gk_8',
    category: 'general',
    difficulty: 'easy',
    question: 'What is the chemical symbol for the element Gold?',
    options: ['Au', 'Ag', 'Fe', 'Gd'],
    correctIndex: 0,
    explanation: '"Au" is derived from Aurum, the Latin word meaning "shining dawn".'
  },

  // ==================== GEOGRAPHY & HISTORY ====================
  {
    id: 'gh_1',
    category: 'geography',
    difficulty: 'easy',
    question: 'What is the capital city of Australia?',
    options: ['Canberra', 'Sydney', 'Melbourne', 'Brisbane'],
    correctIndex: 0,
    explanation: 'Canberra was selected as the compromise capital of Australia in 1908 to resolve the rivalry between Sydney and Melbourne.'
  },
  {
    id: 'gh_2',
    category: 'geography',
    difficulty: 'medium',
    question: 'Which ancient wonder of the world is the only one still largely intact today?',
    options: [
      'The Great Pyramid of Giza',
      'The Colossus of Rhodes',
      'The Lighthouse of Alexandria',
      'The Hanging Gardens of Babylon'
    ],
    correctIndex: 0,
    explanation: 'The Great Pyramid of Giza (built for Pharaoh Khufu circa 2560 BCE) has survived for over 4,500 years.'
  },
  {
    id: 'gh_3',
    category: 'geography',
    difficulty: 'easy',
    question: 'Which river is traditionally considered the longest in the world?',
    options: ['The Nile', 'The Amazon', 'The Yangtze', 'The Mississippi'],
    correctIndex: 0,
    explanation: 'The Nile in northeast Africa is widely recognized as the longest river at approximately 6,650 km (4,132 miles).'
  },
  {
    id: 'gh_4',
    category: 'geography',
    difficulty: 'medium',
    question: 'In what year did the Berlin Wall fall, signaling the impending end of the Cold War in Europe?',
    options: ['1989', '1991', '1985', '1979'],
    correctIndex: 0,
    explanation: 'The Berlin Wall fell on November 9, 1989, leading to the reunification of Germany in October 1990.'
  },
  {
    id: 'gh_5',
    category: 'geography',
    difficulty: 'hard',
    question: 'Which city served as the capital of the Byzantine Empire for over a millennium before falling in 1453?',
    options: ['Constantinople', 'Rome', 'Alexandria', 'Antioch'],
    correctIndex: 0,
    explanation: 'Constantinople (modern-day Istanbul) was founded by Roman Emperor Constantine the Great and fell to the Ottoman Empire in 1453.'
  },
  {
    id: 'gh_6',
    category: 'geography',
    difficulty: 'hard',
    question: 'Which is the world’s largest landlocked country by total land area?',
    options: ['Kazakhstan', 'Mongolia', 'Chad', 'Bolivia'],
    correctIndex: 0,
    explanation: 'Kazakhstan spans over 2.7 million square kilometers, making it the ninth-largest nation and the largest without direct access to the world ocean.'
  },
  {
    id: 'gh_7',
    category: 'geography',
    difficulty: 'easy',
    question: 'Which mountain is the highest peak above sea level on Earth?',
    options: ['Mount Everest', 'K2', 'Kangchenjunga', 'Kilimanjaro'],
    correctIndex: 0,
    explanation: 'Mount Everest in the Himalayas stands at 8,848.86 meters (29,031.7 ft) above sea level.'
  },
  {
    id: 'gh_8',
    category: 'geography',
    difficulty: 'medium',
    question: 'Who was the first female Prime Minister of the United Kingdom, serving from 1979 to 1990?',
    options: ['Margaret Thatcher', 'Theresa May', 'Indira Gandhi', 'Golda Meir'],
    correctIndex: 0,
    explanation: 'Margaret Thatcher, known as the "Iron Lady", was the first woman to hold the office of UK Prime Minister.'
  },

  // ==================== GAMING & POP CULTURE ====================
  {
    id: 'gp_1',
    category: 'gaming',
    difficulty: 'easy',
    question: 'What is the name of the protagonist in Nintendo’s "The Legend of Zelda" series?',
    options: ['Link', 'Zelda', 'Ganon', 'Epona'],
    correctIndex: 0,
    explanation: 'While Princess Zelda is the namesake, the legendary green-clad hero controlled by the player is Link.'
  },
  {
    id: 'gp_2',
    category: 'gaming',
    difficulty: 'medium',
    question: 'Which studio developed the critically acclaimed 2015 RPG "The Witcher 3: Wild Hunt"?',
    options: ['CD Projekt Red', 'Bethesda Softworks', 'Bioware', 'FromSoftware'],
    correctIndex: 0,
    explanation: 'Polish game developer CD Projekt Red developed "The Witcher 3: Wild Hunt", based on Andrzej Sapkowski’s fantasy novels.'
  },
  {
    id: 'gp_3',
    category: 'gaming',
    difficulty: 'easy',
    question: 'In the game Minecraft, which mineral is required along with ancient debris to craft Netherite gear?',
    options: ['Gold Ingot', 'Diamond', 'Iron Ingot', 'Obsidian'],
    correctIndex: 0,
    explanation: 'To craft Netherite Ingot, you combine 4 Netherite Scraps (smelted from ancient debris) with 4 Gold Ingots.'
  },
  {
    id: 'gp_4',
    category: 'gaming',
    difficulty: 'hard',
    question: 'What was the famous cheat code first introduced in Konami’s 1986 NES game "Gradius"?',
    options: [
      'Up, Up, Down, Down, Left, Right, Left, Right, B, A',
      'Down, Down, Up, Up, Left, Right, B, A, Start',
      'Up, Down, Left, Right, Up, Down, Left, Right, A, B',
      'Left, Right, Left, Right, Up, Up, Down, Down, B, A'
    ],
    correctIndex: 0,
    explanation: 'The Konami Code (↑ ↑ ↓ ↓ ← → ← → B A) was created by developer Kazuhisa Hashimoto to make testing Gradius easier.'
  },
  {
    id: 'gp_5',
    category: 'gaming',
    difficulty: 'medium',
    question: 'In the Marvel Cinematic Universe, which Infinity Stone was encased inside the Tesseract?',
    options: ['The Space Stone', 'The Mind Stone', 'The Power Stone', 'The Reality Stone'],
    correctIndex: 0,
    explanation: 'The Tesseract held the blue Space Stone, which grants control over space and instantaneous teleportation.'
  },
  {
    id: 'gp_6',
    category: 'gaming',
    difficulty: 'hard',
    question: 'What is the best-selling video game of all time with over 300 million copies sold?',
    options: ['Minecraft', 'Grand Theft Auto V', 'Tetris (EA)', 'Wii Sports'],
    correctIndex: 0,
    explanation: 'Minecraft officially surpassed 300 million copies sold in 2023, making it the single best-selling video game in history.'
  },
  {
    id: 'gp_7',
    category: 'gaming',
    difficulty: 'easy',
    question: 'In the animated film "Spider-Man: Into the Spider-Verse", what is the real name of the teenage protagonist?',
    options: ['Miles Morales', 'Peter Parker', 'Miguel O’Hara', 'Gwen Stacy'],
    correctIndex: 0,
    explanation: 'Miles Morales is the Afro-Latino teenager from Brooklyn who becomes the new Spider-Man.'
  },
  {
    id: 'gp_8',
    category: 'gaming',
    difficulty: 'medium',
    question: 'Which game director is the visionary creator behind "Metal Gear Solid" and "Death Stranding"?',
    options: ['Hideo Kojima', 'Shigeru Miyamoto', 'Shinji Mikami', 'Hidetaka Miyazaki'],
    correctIndex: 0,
    explanation: 'Hideo Kojima is renowned for his cinematic storytelling, authored the Metal Gear series and founded Kojima Productions.'
  }
];

window.QUIZ_CATEGORIES = QUIZ_CATEGORIES;
window.DEFAULT_QUESTIONS = DEFAULT_QUESTIONS;
