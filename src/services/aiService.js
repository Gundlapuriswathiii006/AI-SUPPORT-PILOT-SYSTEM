import { knowledgeBaseService } from './knowledgeBaseService';

// Common words that shouldn't count toward matching — otherwise two
// completely unrelated questions can "match" the same article just
// because they both contain words like "how", "the", "does", etc.,
// which is the main reason unrelated questions used to get identical
// generic replies.
const STOP_WORDS = new Set([
  'how', 'what', 'when', 'where', 'why', 'who', 'which', 'does', 'do',
  'did', 'is', 'are', 'was', 'were', 'can', 'could', 'would', 'should',
  'the', 'a', 'an', 'to', 'of', 'for', 'in', 'on', 'at', 'my', 'me',
  'i', 'you', 'your', 'and', 'or', 'with', 'about', 'this', 'that',
]);

// Distinct canned answers keyed by topic, covering each of the chat
// widget's starter questions plus common phrasing variants, so that
// different topics reliably produce different answers even when the
// knowledge base itself doesn't have a strong keyword match.
const TOPIC_ANSWERS = [
  {
    id: 'password-reset',
    terms: ['password', 'reset', 'forgot', 'login', 'log in', 'locked', 'access'],
    reply: 'To reset your password: go to the login page, click "Forgot password," enter your work email, then follow the reset link we send you. If your account is locked instead, a support agent can verify your identity and unlock it.',
  },
  {
    id: 'refund',
    terms: ['refund', 'charge', 'payment', 'billing', 'invoice'],
    reply: 'Refund and billing requests are handled by our billing team. Please open a ticket under the "Finance" category with your order or invoice reference, and someone will follow up within 1–2 business days.',
  },
  {
    id: 'vpn',
    terms: ['vpn', 'remote', 'connect', 'network'],
    reply: 'For VPN access: download the VPN client from the company portal, install it, sign in with your company credentials, and select the nearest server. If you can\'t connect, check your internet connection and firewall settings first — if that doesn\'t fix it, submit an IT ticket.',
  },
  {
    id: 'internet-slow',
    terms: ['slow', 'internet', 'wifi', 'connectivity', 'lag'],
    reply: 'For slow or unstable internet: try restarting your device, reconnecting to Wi-Fi or re-seating your ethernet cable, and checking whether the issue affects just your machine or the whole office. If it persists, submit an IT ticket with what you\'ve already tried.',
  },
  {
    id: 'ticket-status',
    terms: ['status', 'ticket', 'update', 'progress'],
    reply: 'You can check the status of any ticket you\'ve raised from "My Tickets" in your dashboard — it shows the current stage (open, in progress, resolved) and who it\'s assigned to. If you\'re not logged in yet, sign in first to see your tickets.',
  },
  {
    id: 'submit-ticket',
    terms: ['submit', 'create ticket', 'raise', 'new ticket', 'file a ticket'],
    reply: 'To submit a support ticket: log in, go to "Create Ticket," choose the relevant category, and describe the issue with as much detail as possible — our AI will automatically classify its priority so it reaches the right team faster.',
  },
  {
    id: 'manager-approval',
    terms: ['manager', 'approval', 'approve'],
    reply: 'Manager approvals are usually needed for expense reimbursements, leave requests, and some equipment purchases. These go through your manager automatically once you submit the relevant request — you don\'t need to contact them separately unless it\'s urgent.',
  },
  {
    id: 'account-update',
    terms: ['account details', 'update account', 'profile', 'email address', 'phone number'],
    reply: 'You can update your account details (name, contact info, avatar) from the Profile page in your dashboard. Email address changes may require verification for security reasons.',
  },
  {
    id: 'equipment',
    terms: ['laptop', 'equipment', 'repair', 'device', 'hardware'],
    reply: 'To request equipment repair or replacement: submit a ticket under "Facilities," include the device model and serial number, and describe the issue. Our team typically reaches out within 24 hours to arrange pickup or an on-site fix.',
  },
  {
    id: 'leave',
    terms: ['leave', 'holiday', 'vacation', 'time off', 'pto'],
    reply: 'To request leave: open the HR portal, go to "Leave Requests," pick your dates and leave type, then submit for manager approval. Annual leave needs at least 2 weeks\' notice; emergency leave can go in same-day with a heads-up to your manager.',
  },
  {
    id: 'software',
    terms: ['software', 'install', 'license'],
    reply: 'To request software: check it\'s on the approved list, then submit a ticket with the software name and a short business justification (include the license key if you have one). IT usually installs approved software within 1–2 business days.',
  },
];

/**
 * Scores knowledge-base articles against a question using weighted term
 * overlap: title matches count more than body matches, and matches are
 * normalized against the number of significant words in the question so
 * that longer articles don't win purely by containing more text.
 */
function bestArticle(question, articles) {
  const words = [...new Set(
    question
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
  )];

  if (words.length === 0 || !articles?.length) return undefined;

  const scored = articles
    .map((article) => {
      const title = (article.title || '').toLowerCase();
      const content = (article.content || '').toLowerCase();
      let score = 0;
      words.forEach((word) => {
        if (title.includes(word)) score += 3;
        if (content.includes(word)) score += 1;
      });
      return { article, score: score / words.length };
    })
    .filter(({ score }) => score >= 1)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.article;
}

/**
 * Finds the best-matching canned topic answer for a question, scoring by
 * how many of the topic's terms actually appear (not just the first hit),
 * so overlapping topics (e.g. "vpn" vs "network") resolve to the more
 * specific one instead of whichever was declared first.
 */
function bestTopicAnswer(question) {
  const normalized = question.toLowerCase();
  const scored = TOPIC_ANSWERS
    .map((topic) => ({
      topic,
      score: topic.terms.filter((term) => normalized.includes(term)).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.topic;
}

// Varied "no confident answer" replies so that repeated unmatched
// questions don't all look like a copy-pasted bot response.
const NO_MATCH_REPLIES = [
  (q) => `I couldn't find a confident answer about "${q}" in the knowledge base yet. Want to create a ticket so a support agent can help directly?`,
  (q) => `Hmm, I don't have a solid answer on that one ("${q}") from what's in the knowledge base right now. A support agent can dig into it if you open a ticket.`,
  (q) => `That's outside what I can confidently answer from the knowledge base at the moment. Creating a ticket will get a real person looking at "${q}" for you.`,
];

export const aiService = {
  generateReply: async (ticket) => {
    const articles = await knowledgeBaseService.getSuggestedArticles(ticket, 2);
    if (articles.length) {
      return `Hi ${ticket.raisedBy || 'there'},\n\nThanks for contacting SupportPilot. Based on our knowledge base:\n\n${articles[0].content}\n\nPlease let us know if this resolves the issue.`;
    }
    return `Hi ${ticket.raisedBy || 'there'},\n\nThanks for reaching out. We are reviewing your request and will follow up with the next steps shortly.\n\nBest,\nSupportPilot Support`;
  },

  answerQuestion: async (question) => {
    const normalized = question.trim();
    if (!normalized) {
      return { answer: 'Tell me what you need help with and I\u2019ll search the support knowledge base.' };
    }

    // 1. Try the real knowledge base first — most specific and most likely to be current.
    const articles = await knowledgeBaseService.getArticles();
    const article = bestArticle(normalized, articles);
    if (article) return { answer: article.content, source: article.title };

    // 2. Fall back to topic-matched canned answers, which cover common
    //    questions that aren't (yet) written up as KB articles.
    const topic = bestTopicAnswer(normalized);
    if (topic) return { answer: topic.reply, source: 'Support guidance' };

    // 3. No confident match anywhere — hand off to a human, with a
    //    reply that at least references what was actually asked instead
    //    of a single fixed sentence every time.
    const pick = NO_MATCH_REPLIES[Math.floor(Math.random() * NO_MATCH_REPLIES.length)];
    return {
      answer: pick(normalized.length > 60 ? `${normalized.slice(0, 57)}...` : normalized),
      needsAgent: true,
    };
  },
};

export default aiService;
