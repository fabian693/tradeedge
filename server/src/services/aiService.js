const Anthropic = require('@anthropic-ai/sdk');

const MODEL = 'claude-sonnet-4-5';

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

function isConfigured() {
  return !!process.env.ANTHROPIC_API_KEY;
}

function bufferToImageBlock(buffer, mimetype) {
  return {
    type: 'image',
    source: {
      type: 'base64',
      media_type: mimetype || 'image/png',
      data: buffer.toString('base64'),
    },
  };
}

function extractJson(text) {
  // Claude sometimes wraps JSON in ```json fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenceMatch ? fenceMatch[1] : text;
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found in AI response');
  return JSON.parse(raw.slice(start, end + 1));
}

/**
 * Analyze a trading chart screenshot and extract trade fields.
 * Returns a partial trade object matching the journal form fields.
 */
async function analyzeScreenshot(buffer, mimetype) {
  const client = getClient();
  if (!client) {
    const err = new Error('AI features are not configured. Add ANTHROPIC_API_KEY to enable screenshot analysis.');
    err.code = 'AI_NOT_CONFIGURED';
    throw err;
  }

  const prompt = `You are analyzing a trading chart screenshot for a futures trading journal (NQ or ES).
Look at the chart and extract whatever trade information you can identify: entry price, stop loss price,
take profit price, exit price (if visible), market (NQ or ES), direction (Long or Short), and the trading
session (London or NY) if a time/date is visible.

Respond with ONLY a JSON object using this exact shape (omit fields you cannot determine, or use null):
{
  "market": "NQ" | "ES" | null,
  "direction": "Long" | "Short" | null,
  "session": "London" | "NY" | null,
  "entryPrice": number | null,
  "stopLoss": number | null,
  "takeProfit": number | null,
  "exitPrice": number | null,
  "notes": "short summary of what you see on the chart (max 2 sentences)"
}`;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          bufferToImageBlock(buffer, mimetype),
          { type: 'text', text: prompt },
        ],
      },
    ],
  });

  const text = message.content.map((b) => (b.type === 'text' ? b.text : '')).join('\n');
  return extractJson(text);
}

/**
 * Generate an AI rating + feedback for a completed trade, optionally using its screenshot.
 * Returns { rating: 1-5, feedback: string }
 */
async function rateTrade(trade, buffer, mimetype) {
  const client = getClient();
  if (!client) {
    const err = new Error('AI features are not configured. Add ANTHROPIC_API_KEY to enable AI trade ratings.');
    err.code = 'AI_NOT_CONFIGURED';
    throw err;
  }

  const summary = {
    market: trade.market,
    session: trade.session,
    direction: trade.direction,
    dailyBias: trade.dailyBias,
    setupGrade: trade.setupGrade,
    confirmation1: trade.confirmation1,
    confirmation2: trade.confirmation2,
    entryPrice: trade.entryPrice,
    slPrice: trade.slPrice,
    slType: trade.slType,
    tpPrice: trade.tpPrice,
    contracts: trade.contracts,
    rrTarget: trade.rrTarget,
    exitPrice: trade.exitPrice,
    result: trade.result,
    rrAchieved: trade.rrAchieved,
    pnl: trade.pnl,
    ruleViolation: trade.ruleViolation,
    violationDescription: trade.violationDescription,
    wentWell: trade.wentWell,
    toImprove: trade.toImprove,
    notes: trade.notes,
    killzoneConfirmed: trade.killzoneConfirmed,
  };

  const prompt = `You are a professional trading coach reviewing a trade from a funded trader's journal.
Here is the trade data as JSON:
${JSON.stringify(summary, null, 2)}

${buffer ? 'A screenshot of the trade chart is attached as well.' : 'No screenshot is attached.'}

Rate the QUALITY of this trade (not just the outcome) on a scale of 1 to 5, where 5 means excellent
adherence to a sound process (good setup, confirmations, risk management, discipline) and 1 means a poor
process trade (rule violations, weak setup, poor risk management), regardless of whether it won or lost.

Respond with ONLY a JSON object in this exact shape:
{
  "rating": 1 | 2 | 3 | 4 | 5,
  "feedback": "2-4 sentences of constructive feedback on this trade's process and what to improve"
}`;

  const content = [];
  if (buffer) content.push(bufferToImageBlock(buffer, mimetype));
  content.push({ type: 'text', text: prompt });

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: 'user', content }],
  });

  const text = message.content.map((b) => (b.type === 'text' ? b.text : '')).join('\n');
  return extractJson(text);
}

module.exports = {
  isConfigured,
  analyzeScreenshot,
  rateTrade,
};
