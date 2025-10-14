const readAloudPrompts = [
  "Legends whisper that the aurora is a gateway between worlds, shimmering whenever brave voices tell their stories.",
  "The crystal library of Elyndor contains knowledge etched into light, waiting for the worthy to speak it aloud.",
  "As the moon climbed over the citadel, the guardians prepared their vows with calm and steady voices."
];

const repeatSentences = [
  "Every melody begins with a single bold note.",
  "Hidden rivers carve their paths beneath silent forests.",
  "The brightest ideas arrive like comets in the night sky."
];

const describeImageSvgs = [
  `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='220'><defs><linearGradient id='g' x1='0' x2='0' y1='0' y2='1'><stop offset='0' stop-color='%23a18cd1'/><stop offset='1' stop-color='%23fbc2eb'/></linearGradient></defs><rect width='320' height='220' rx='24' fill='%2325124a'/><circle cx='90' cy='120' r='55' fill='url(%23g)' opacity='0.8'/><rect x='150' y='60' width='140' height='30' rx='12' fill='%23ffd166'/><rect x='150' y='110' width='120' height='26' rx='10' fill='%2390e0ef'/><rect x='150' y='150' width='90' height='24' rx='9' fill='%23ffafcc'/><text x='50%' y='205' fill='%23fff' font-size='18' text-anchor='middle' font-family='Verdana'>Sky Harbor Plaza</text></svg>`,
  `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='220'><rect width='320' height='220' rx='20' fill='%230b3d91'/><polyline points='30,180 90,120 150,140 210,80 270,100' fill='none' stroke='%23ffba08' stroke-width='8' stroke-linecap='round' stroke-linejoin='round'/><rect x='30' y='40' width='120' height='30' rx='12' fill='%23fdfcdc'/><text x='90' y='60' font-size='16' text-anchor='middle' fill='%230b3d91' font-family='Verdana'>Harvest Output</text><g fill='%23ffd166'><circle cx='30' cy='180' r='6'/><circle cx='90' cy='120' r='6'/><circle cx='150' cy='140' r='6'/><circle cx='210' cy='80' r='6'/><circle cx='270' cy='100' r='6'/></g></svg>`,
  `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='220'><rect width='320' height='220' rx='18' fill='%2300193a'/><g transform='translate(50,40)' font-family='Verdana' font-size='12' fill='%23fff'><text x='60' y='0' font-size='16' text-anchor='middle'>Task Wheel</text><g transform='translate(60,80)'><circle r='70' fill='%2320476c'/><path d='M0 0 L0 -70 A70 70 0 0 1 67 18 Z' fill='%238ecae6'/><path d='M0 0 L67 18 A70 70 0 0 1 43 57 Z' fill='%23ffb703'/><path d='M0 0 L43 57 A70 70 0 0 1 -44 56 Z' fill='%23fb8500'/><path d='M0 0 L-44 56 A70 70 0 0 1 -21 -67 Z' fill='%23023457'/><path d='M0 0 L-21 -67 A70 70 0 0 1 0 -70 Z' fill='%238ab17d'/></g><g transform='translate(0,170)' fill='%23cdeae5'><circle cx='0' r='5'/><text x='12' alignment-baseline='middle'>Planning</text><circle cx='90' r='5'/><text x='102' alignment-baseline='middle'>Design</text><circle cx='180' r='5'/><text x='192' alignment-baseline='middle'>Launch</text></g></g></svg>`
];

const lecturePrompts = [
  {
    title: "Solar Gardens",
    keyPoints: ["floating mirrors", "store warmth", "night illumination", "eco engineers"],
    summary:
      "In coastal cities, eco engineers deploy floating mirrors that store warmth during the day and release gentle light at night, helping gardens bloom after sunset while reducing energy use."
  },
  {
    title: "River Archives",
    keyPoints: ["memory stones", "currents", "story keepers", "flood prevention"],
    summary:
      "Ancient story keepers place memory stones along a riverbed. As currents pass over them, the stones record data that predicts floods and guides conservation efforts for nearby villages."
  }
];

const shortQuestions = [
  {
    question: "What instrument has black and white keys and is often found in concert halls?",
    answer: "piano"
  },
  {
    question: "Which planet is known as the Red Planet?",
    answer: "mars"
  },
  {
    question: "What do bees collect from flowers to make honey?",
    answer: "nectar"
  }
];

const state = {
  history: [],
  coins: 0,
  xp: 0,
  completedChambers: new Set(),
  currentPrompt: {
    readAloud: null,
    repeatSentence: null,
    describeImage: null,
    retellLecture: null,
    shortQuestion: null
  }
};

const badgeThresholds = [
  { label: "Fluent Phoenix", emoji: "🕊️", key: "fluency" },
  { label: "Clear Wizard", emoji: "🔮", key: "pronunciation" },
  { label: "Echo Knight", emoji: "🛡️", key: "content" }
];

const recognition = createRecognition();
let activeMode = null;
let lastStartTime = null;

const readAloudText = document.getElementById("readAloudText");
const describeImage = document.getElementById("describeImage");
const creativityMeter = document.getElementById("creativityMeter");
const knowledgeOrbs = document.getElementById("knowledgeOrbs");
const sparkBurst = document.getElementById("sparkBurst");
const progressMap = document.getElementById("progressMap");
const guardianStatus = document.getElementById("guardianStatus");

const chamberElements = document.querySelectorAll(".chamber");
const recordButtons = document.querySelectorAll(".record-button");
const playButtons = document.querySelectorAll(".play-button");

const resultLabels = {
  readAloud: document.getElementById("readAloudResult"),
  repeatSentence: document.getElementById("repeatSentenceResult"),
  describeImage: document.getElementById("describeImageResult"),
  retellLecture: document.getElementById("retellLectureResult"),
  shortQuestion: document.getElementById("shortQuestionResult")
};

const visualizers = {
  readAloud: document.getElementById("readAloudOrb"),
  repeatSentence: document.getElementById("repeatSentenceBeam"),
  describeImage: creativityMeter,
  retellLecture: knowledgeOrbs,
  shortQuestion: sparkBurst
};

init();

function init() {
  if (!('mediaDevices' in navigator)) {
    alert('This experience needs a microphone-enabled browser.');
  }

  loadFromStorage();
  prepareChambers();
  updateGlobalScores();
  highlightProgress();
  setupKnowledgeOrbs();

  recordButtons.forEach(btn => btn.addEventListener('click', handleRecordClick));
  playButtons.forEach(btn => btn.addEventListener('click', handlePlayClick));

  if (recognition) {
    recognition.addEventListener('result', handleRecognitionResult);
    recognition.addEventListener('end', handleRecognitionEnd);
    recognition.addEventListener('error', () => stopRecordingState());
  }
}

function createRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('Speech recognition is not available.');
    return null;
  }
  const rec = new SpeechRecognition();
  rec.lang = 'en-US';
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  return rec;
}

function prepareChambers() {
  state.currentPrompt.readAloud = randomItem(readAloudPrompts);
  state.currentPrompt.repeatSentence = randomItem(repeatSentences);
  state.currentPrompt.describeImage = randomItem(describeImageSvgs);
  state.currentPrompt.retellLecture = randomItem(lecturePrompts);
  state.currentPrompt.shortQuestion = randomItem(shortQuestions);

  readAloudText.textContent = state.currentPrompt.readAloud;
  describeImage.src = state.currentPrompt.describeImage;
  describeImage.alt = 'Prompt for description';
}

function handleRecordClick(event) {
  const button = event.currentTarget;
  const mode = button.dataset.mode;
  if (!recognition) {
    resultLabels[mode].textContent = 'Speech recognition not supported in this browser.';
    return;
  }

  if (activeMode === mode) {
    recognition.stop();
    return;
  }

  activeMode = mode;
  lastStartTime = Date.now();
  resetVisuals(mode);
  button.classList.add('recording');
  recognition.start();
  resultLabels[mode].textContent = 'Listening...';
}

function handleRecognitionResult(event) {
  if (!activeMode) return;
  const transcript = event.results[0][0].transcript.trim();
  const elapsedSeconds = (Date.now() - (lastStartTime || Date.now())) / 1000;
  const words = transcript.split(/\s+/).filter(Boolean).length;
  const wordsPerMinute = elapsedSeconds > 0 ? (words / elapsedSeconds) * 60 : words;

  const analysis = analyzeTranscript(activeMode, transcript, wordsPerMinute);
  state.history.push(analysis.scores);
  persistState();
  updateGlobalScores();
  applyRewards(analysis.rewards);
  animateMode(activeMode, analysis.visualCharge);
  markChamberCompletion(activeMode, analysis.completionScore);
  updateResults(activeMode, analysis.feedback, transcript);
  highlightProgress();
  stopRecordingState();
}

function handleRecognitionEnd() {
  stopRecordingState();
}

function stopRecordingState() {
  recordButtons.forEach(btn => btn.classList.remove('recording'));
  activeMode = null;
}

function analyzeTranscript(mode, transcript, wpm) {
  const cleaned = transcript.toLowerCase();
  switch (mode) {
    case 'readAloud':
      return evaluateReadAloud(transcript, wpm);
    case 'repeatSentence':
      return evaluateRepeatSentence(transcript);
    case 'describeImage':
      return evaluateDescribeImage(cleaned);
    case 'retellLecture':
      return evaluateRetellLecture(cleaned);
    case 'shortQuestion':
      return evaluateShortQuestion(cleaned);
    default:
      return {
        scores: { fluency: 0, pronunciation: 0, content: 0 },
        rewards: { coins: 0, xp: 0 },
        feedback: 'Unknown chamber.',
        visualCharge: 0,
        completionScore: 0
      };
  }
}

function evaluateReadAloud(transcript, wpm) {
  const target = state.currentPrompt.readAloud.toLowerCase();
  const similarity = wordMatchScore(target, transcript.toLowerCase());
  const pacingScore = clamp(Math.abs(160 - wpm) / 160, 0, 1);
  const fluency = clamp(1 - pacingScore, 0, 1) * 0.6 + Math.min(wpm / 180, 1) * 0.4;
  const pronunciation = clamp(similarity, 0, 1);
  const content = clamp(similarity + 0.15, 0, 1);
  const completionScore = (fluency + pronunciation + content) / 3;

  return {
    scores: { fluency, pronunciation, content },
    rewards: computeRewards(completionScore, 30, 18),
    feedback: `Magic power released! Similarity ${(similarity * 100).toFixed(0)}% with ${wpm.toFixed(0)} WPM.`,
    visualCharge: completionScore,
    completionScore
  };
}

function evaluateRepeatSentence(transcript) {
  const target = state.currentPrompt.repeatSentence.toLowerCase();
  const similarity = wordMatchScore(target, transcript.toLowerCase());
  const rhythmScore = cadenceScore(transcript);
  const pronunciation = clamp(similarity, 0, 1);
  const fluency = clamp(rhythmScore, 0, 1);
  const content = clamp((similarity + rhythmScore) / 2, 0, 1);
  const completionScore = (fluency + pronunciation + content) / 3;

  return {
    scores: { fluency, pronunciation, content },
    rewards: computeRewards(completionScore, 22, 14),
    feedback: `Echo Power ${Math.round(completionScore * 100)}%!`,
    visualCharge: completionScore,
    completionScore
  };
}

function evaluateDescribeImage(cleanedTranscript) {
  const vocabulary = uniqueWords(cleanedTranscript);
  const connectors = ['because', 'while', 'however', 'therefore', 'meanwhile', 'overall'];
  const connectorUsage = connectors.filter(word => cleanedTranscript.includes(word)).length;
  const sentenceCount = cleanedTranscript.split(/[.!?]/).filter(Boolean).length;
  const fluency = clamp(sentenceCount / 3, 0, 1);
  const pronunciation = clamp(vocabulary.length / 30, 0, 1) * 0.6 + clamp(sentenceCount / 4, 0, 1) * 0.4;
  const content = clamp((vocabulary.length / 25) + (connectorUsage * 0.1), 0, 1);
  const completionScore = (fluency + pronunciation + content) / 3;

  return {
    scores: { fluency, pronunciation, content },
    rewards: computeRewards(completionScore, 26, 16),
    feedback: `Creativity Meter at ${(content * 100).toFixed(0)}%!`,
    visualCharge: clamp(content, 0, 1),
    completionScore
  };
}

function evaluateRetellLecture(cleanedTranscript) {
  const prompt = state.currentPrompt.retellLecture;
  const keyMatches = prompt.keyPoints.filter(point => cleanedTranscript.includes(point)).length;
  const sentenceCount = cleanedTranscript.split(/[.!?]/).filter(Boolean).length;
  const fluency = clamp(sentenceCount / 4, 0, 1);
  const content = clamp(keyMatches / prompt.keyPoints.length, 0, 1);
  const pronunciation = clamp((fluency + content) / 2, 0, 1);
  const completionScore = (fluency + pronunciation + content) / 3;

  return {
    scores: { fluency, pronunciation, content },
    rewards: computeRewards(completionScore, 35, 20),
    feedback: `${keyMatches} Knowledge Orbs ignited!`,
    visualCharge: content,
    completionScore
  };
}

function evaluateShortQuestion(cleanedTranscript) {
  const prompt = state.currentPrompt.shortQuestion;
  const answerWords = prompt.answer.split(/\s+/);
  const isCorrect = answerWords.every(word => cleanedTranscript.includes(word));
  const fluency = isCorrect ? 0.9 : 0.4;
  const pronunciation = isCorrect ? 0.85 : 0.5;
  const content = isCorrect ? 1 : 0.2;
  const completionScore = (fluency + pronunciation + content) / 3;

  return {
    scores: { fluency, pronunciation, content },
    rewards: computeRewards(completionScore, 18, isCorrect ? 12 : 5),
    feedback: isCorrect ? 'Direct hit! Bonus sparks gained.' : 'The guardian hints you try again.',
    visualCharge: isCorrect ? 1 : 0.2,
    completionScore
  };
}

function wordMatchScore(target, attempt) {
  const targetWords = target.split(/[^a-z]+/).filter(Boolean);
  const attemptWords = attempt.split(/[^a-z]+/).filter(Boolean);
  if (!targetWords.length || !attemptWords.length) return 0;
  const matches = attemptWords.reduce((count, word) => count + (targetWords.includes(word) ? 1 : 0), 0);
  return matches / targetWords.length;
}

function cadenceScore(transcript) {
  const phrases = transcript.split(/[,.;!?]/).filter(Boolean).length;
  const words = transcript.split(/\s+/).filter(Boolean).length;
  if (!words) return 0;
  const averagePhraseLength = words / Math.max(phrases, 1);
  const ideal = 6;
  const deviation = Math.abs(averagePhraseLength - ideal);
  return clamp(1 - deviation / ideal, 0, 1);
}

function uniqueWords(text) {
  return Array.from(new Set(text.split(/[^a-z]+/).filter(Boolean)));
}

function computeRewards(score, coinMax, xpMax) {
  const coins = Math.round(score * coinMax);
  const xp = Math.round(score * xpMax);
  state.coins += coins;
  state.xp += xp;
  persistState();
  return { coins, xp };
}

function applyRewards(rewards) {
  document.getElementById('coinTotal').textContent = state.coins;
  document.getElementById('xpTotal').textContent = state.xp;

  const guardianReady = state.completedChambers.size === 5;
  guardianStatus.textContent = guardianReady
    ? 'The Speaking Guardian awaits your duel!'
    : `Chambers cleared: ${state.completedChambers.size}/5`;
}

function animateMode(mode, charge) {
  const visual = visualizers[mode];
  if (!visual) return;
  switch (mode) {
    case 'readAloud':
      visual.classList.toggle('charged', charge > 0.5);
      break;
    case 'repeatSentence':
      visual.classList.toggle('charged', charge > 0.4);
      break;
    case 'describeImage':
      visual.style.setProperty('--creativity', `${Math.round(charge * 100)}%`);
      break;
    case 'retellLecture':
      activateOrbs(Math.round(charge * 3));
      break;
    case 'shortQuestion':
      visual.classList.toggle('active', charge > 0.6);
      if (charge > 0.6) {
        setTimeout(() => visual.classList.remove('active'), 1200);
      }
      break;
  }
}

function setupKnowledgeOrbs() {
  knowledgeOrbs.innerHTML = '';
  Array.from({ length: 6 }).forEach(() => {
    const orb = document.createElement('div');
    orb.className = 'orb';
    knowledgeOrbs.appendChild(orb);
  });
}

function activateOrbs(count) {
  const orbs = knowledgeOrbs.querySelectorAll('.orb');
  orbs.forEach((orb, index) => {
    orb.classList.toggle('active', index < count);
  });
}

function updateResults(mode, feedback, transcript) {
  resultLabels[mode].textContent = `${feedback} You said: "${transcript}"`;
}

function updateGlobalScores() {
  if (!state.history.length) return;
  const totals = state.history.reduce(
    (acc, entry) => {
      acc.fluency += entry.fluency;
      acc.pronunciation += entry.pronunciation;
      acc.content += entry.content;
      return acc;
    },
    { fluency: 0, pronunciation: 0, content: 0 }
  );
  const count = state.history.length;
  const averages = {
    fluency: totals.fluency / count,
    pronunciation: totals.pronunciation / count,
    content: totals.content / count
  };

  document.getElementById('fluencyBar').style.width = `${Math.round(averages.fluency * 100)}%`;
  document.getElementById('pronunciationBar').style.width = `${Math.round(averages.pronunciation * 100)}%`;
  document.getElementById('contentBar').style.width = `${Math.round(averages.content * 100)}%`;
  document.getElementById('speakingPower').textContent = `${Math.round(((averages.fluency + averages.pronunciation + averages.content) / 3) * 100)}%`;

  renderBadges(averages);
}

function renderBadges(averages) {
  const container = document.getElementById('badgeDisplay');
  container.innerHTML = '';
  badgeThresholds.forEach(badge => {
    if (averages[badge.key] >= 0.65) {
      const badgeEl = document.createElement('div');
      badgeEl.className = 'badge';
      badgeEl.textContent = `${badge.emoji} ${badge.label}`;
      container.appendChild(badgeEl);
    }
  });
}

function markChamberCompletion(mode, completionScore) {
  const thresholds = {
    readAloud: 0.55,
    repeatSentence: 0.55,
    describeImage: 0.5,
    retellLecture: 0.5,
    shortQuestion: 0.6
  };
  if (completionScore >= thresholds[mode]) {
    state.completedChambers.add(mode);
    persistState();
  }
}

function highlightProgress() {
  const chamberOrder = ['readAloud', 'repeatSentence', 'describeImage', 'retellLecture', 'shortQuestion'];
  chamberElements.forEach((section, index) => {
    const mode = chamberOrder[index];
    section.classList.toggle('active', state.completedChambers.has(mode));
  });

  Array.from(progressMap.children).forEach((node, index) => {
    const mode = chamberOrder[index];
    node.classList.toggle('active', state.completedChambers.has(mode));
  });
}

function handlePlayClick(event) {
  const mode = event.currentTarget.dataset.mode;
  switch (mode) {
    case 'repeatSentence':
      speakPrompt(state.currentPrompt.repeatSentence, 'energetic');
      break;
    case 'retellLecture':
      speakPrompt(state.currentPrompt.retellLecture.summary, 'narrator');
      break;
    case 'shortQuestion':
      speakPrompt(state.currentPrompt.shortQuestion.question, 'question');
      resultLabels.shortQuestion.textContent = state.currentPrompt.shortQuestion.question;
      break;
    default:
      break;
  }
}

function speakPrompt(text, voiceHint = 'default') {
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = speechSynthesis.getVoices();
  if (voices.length) {
    const preferred = voices.find(v =>
      voiceHint === 'energetic'
        ? v.name.toLowerCase().includes('english')
        : voiceHint === 'narrator'
        ? v.name.toLowerCase().includes('fiona') || v.name.toLowerCase().includes('serena')
        : voiceHint === 'question'
        ? v.name.toLowerCase().includes('daniel')
        : false
    );
    if (preferred) utterance.voice = preferred;
  }
  utterance.pitch = voiceHint === 'energetic' ? 1.2 : voiceHint === 'narrator' ? 0.9 : 1;
  utterance.rate = 0.95;
  speechSynthesis.speak(utterance);
}

function resetVisuals(mode) {
  if (mode === 'readAloud') {
    visualizers.readAloud.classList.remove('charged');
  }
  if (mode === 'repeatSentence') {
    visualizers.repeatSentence.classList.remove('charged');
  }
  if (mode === 'describeImage') {
    visualizers.describeImage.style.setProperty('--creativity', '0%');
  }
  if (mode === 'retellLecture') {
    activateOrbs(0);
  }
  if (mode === 'shortQuestion') {
    visualizers.shortQuestion.classList.remove('active');
  }
}

function persistState() {
  const data = {
    history: state.history,
    coins: state.coins,
    xp: state.xp,
    completedChambers: Array.from(state.completedChambers)
  };
  localStorage.setItem('voiceQuestProgress', JSON.stringify(data));
}

function loadFromStorage() {
  const stored = localStorage.getItem('voiceQuestProgress');
  if (!stored) return;
  try {
    const data = JSON.parse(stored);
    state.history = data.history || [];
    state.coins = data.coins || 0;
    state.xp = data.xp || 0;
    state.completedChambers = new Set(data.completedChambers || []);
    document.getElementById('coinTotal').textContent = state.coins;
    document.getElementById('xpTotal').textContent = state.xp;
  } catch (error) {
    console.warn('Failed to load stored progress', error);
  }
}

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

window.addEventListener('beforeunload', () => speechSynthesis.cancel());
