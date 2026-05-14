/**
 * TOEFL Scoring Spike
 * Gate: Pearson r > 0.65 vs reference scores using claude-haiku-4-5
 * Estimated cost: ~$0.02 for 20 responses
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually — no extra dependency needed
const envPath = join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
  }
}

const { task, responses } = JSON.parse(fs.readFileSync(join(__dirname, 'responses.json'), 'utf8'));

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a trained TOEFL Speaking rater. Score the student response using the official ETS TOEFL Speaking rubric below.

DELIVERY (0-4):
4 — Clear, fluid, sustained. Minor pronunciation/intonation lapses don't affect intelligibility.
3 — Generally clear with some fluidity. Minor pronunciation/intonation/pacing issues, may require listener effort at times.
2 — Basically intelligible but listener effort needed: unclear articulation, awkward intonation, choppy rhythm. Meaning obscured in places.
1 — Consistent pronunciation/intonation problems cause considerable listener effort. Choppy, fragmented.
0 — No response.

LANGUAGE USE (0-4):
4 — Effective grammar and vocabulary. High automaticity, good control of basic and complex structures. Minor errors don't obscure meaning.
3 — Fairly automatic and effective. May have some imprecise vocab or limited grammatical range. Doesn't seriously interfere with communication.
2 — Limited range and control. Often prevents full expression. Mostly basic structures. Simple or unclear connections between ideas.
1 — Severely limited grammar/vocab prevents expression of ideas. May rely on formulaic phrases.
0 — No response.

TOPIC DEVELOPMENT (0-4):
4 — Sustained and sufficient. Well developed and coherent. Relationships between ideas are clear.
3 — Mostly coherent and sustained. Conveys relevant ideas. Development somewhat limited, lacks elaboration/specificity.
2 — Connected to task but limited number/development of ideas. Mostly basic ideas with limited elaboration. At times vague or unclear.
1 — Limited relevant content. Lacks substance beyond basic ideas. May be unable to complete the task.
0 — No response.

IMPORTANT:
- Score integers only (0-4).
- A 4 means near-native performance. A 1 means severe communication difficulty.
- Base scores solely on the rubric descriptors above — do not inflate.

Respond ONLY with valid JSON, no other text:
{"delivery": <int>, "language_use": <int>, "topic_development": <int>, "reasoning": "<one sentence>"}`;

function pearsonR(x, y) {
  const n = x.length;
  const mx = x.reduce((a, b) => a + b) / n;
  const my = y.reduce((a, b) => a + b) / n;
  const num = x.reduce((acc, xi, i) => acc + (xi - mx) * (y[i] - my), 0);
  const dx = Math.sqrt(x.reduce((acc, xi) => acc + (xi - mx) ** 2, 0));
  const dy = Math.sqrt(y.reduce((acc, yi) => acc + (yi - my) ** 2, 0));
  return num / (dx * dy);
}

function mae(pred, actual) {
  return pred.reduce((acc, p, i) => acc + Math.abs(p - actual[i]), 0) / pred.length;
}

function avg(scores) {
  return (scores.delivery + scores.language_use + scores.topic_development) / 3;
}

async function score(text, model) {
  const msg = await client.messages.create({
    model,
    max_tokens: 200,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Task: "${task}"\n\n<student_response>\n${text}\n</student_response>`
    }]
  });
  const raw = msg.content[0].text.trim();
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error(`Failed to parse: ${raw}`);
  }
}

async function run() {
  const MODEL = 'claude-haiku-4-5-20251001';

  console.log('\n=== TOEFL Scoring Spike ===');
  console.log(`Model: ${MODEL}`);
  console.log(`Responses: ${responses.length}`);
  console.log(`Gate: Pearson r > 0.65`);
  console.log(`Est. cost: ~$0.02\n`);

  const results = [];

  for (const r of responses) {
    process.stdout.write(`[${String(r.id).padStart(2)}] ${r.label.slice(0, 42).padEnd(42)} `);

    const h = await score(r.text, MODEL);
    const refAvg   = avg(r.reference);
    const haikuAvg = avg(h);

    results.push({
      id: r.id,
      ref: refAvg,
      refRaw: r.reference,
      haiku: haikuAvg,
      haikuRaw: h
    });

    console.log(`ref=${refAvg.toFixed(2)}  haiku=${haikuAvg.toFixed(2)}  (${h.reasoning})`);
  }

  const dims = ['delivery', 'language_use', 'topic_development'];
  const refDims   = dims.map(d => results.map(r => r.refRaw[d]));
  const haikuDims = dims.map(d => results.map(r => r.haikuRaw[d]));

  const rOverall = pearsonR(results.map(r => r.haiku), results.map(r => r.ref));
  const maeOverall = mae(results.map(r => r.haiku), results.map(r => r.ref));

  console.log('\n' + '='.repeat(60));
  console.log('RESULTS');
  console.log('='.repeat(60));

  console.log(`\nOverall  r=${rOverall.toFixed(3)}  MAE=${maeOverall.toFixed(3)}  ${rOverall > 0.65 ? '✓ PASS' : '✗ FAIL'}`);

  console.log('\nPer-dimension:');
  dims.forEach((d, i) => {
    const r = pearsonR(haikuDims[i], refDims[i]);
    console.log(`  ${d.padEnd(18)} r=${r.toFixed(3)}  ${r > 0.65 ? '✓' : '✗'}`);
  });

  console.log('\n' + '='.repeat(60));
  if (rOverall > 0.65) {
    console.log('VERDICT: ✓ SPIKE PASSED — Haiku meets gate. Week 1 build may proceed.');
    console.log('         Haiku validated for free tier. Sonnet (premium) expected to score higher.');
  } else {
    console.log('VERDICT: ✗ SPIKE FAILED — Scoring correlation below threshold.');
    console.log('         Pivot: provide text feedback only, remove numeric TOEFL scores.');
  }
  console.log('='.repeat(60));

  fs.writeFileSync(join(__dirname, 'spike-results.json'), JSON.stringify({
    timestamp: new Date().toISOString(),
    model: MODEL,
    gate: { threshold: 0.65, passed: rOverall > 0.65 },
    overall: { r: rOverall, mae: maeOverall },
    perDimension: Object.fromEntries(dims.map((d, i) => [d, pearsonR(haikuDims[i], refDims[i])])),
    results
  }, null, 2));
  console.log('\nFull results → spike-results.json');
}

run().catch(err => {
  console.error('\nError:', err.message);
  process.exit(1);
});
