// Knowledge Base — local-storage backed, shared by Admin (manage), Support and
// Employee (browse / get suggestions). No backend involved.

const KB_KEY = 'supportpilot_kb_articles';

const DEFAULT_ARTICLES = [
  {
    id: 'kb-1',
    title: 'Resetting your password',
    category: 'Access',
    content: 'Go to the login page and click "Forgot password" to receive a reset link by email.',
  },
  {
    id: 'kb-2',
    title: 'Requesting VPN access',
    category: 'Network',
    content: 'Submit a ticket under the "Network" category with your device details and manager approval.',
  },
  {
    id: 'kb-3',
    title: 'Refund and billing requests',
    category: 'Account',
    content: 'For a refund, include your invoice or order reference in a ticket. The billing team reviews eligible requests and responds by email.',
  },
  {
    id: 'kb-4',
    title: 'Account access issues',
    category: 'Access',
    content: 'If you cannot access your account, confirm your work email and try the password reset flow. Contact support if the account remains locked.',
  },
];

function getArticles() {
  try {
    const stored = localStorage.getItem(KB_KEY);
    if (!stored) {
      localStorage.setItem(KB_KEY, JSON.stringify(DEFAULT_ARTICLES));
      return DEFAULT_ARTICLES;
    }
    return JSON.parse(stored);
  } catch {
    return DEFAULT_ARTICLES;
  }
}

function saveArticles(articles) {
  localStorage.setItem(KB_KEY, JSON.stringify(articles));
}

// Very small keyword/category overlap scorer — stands in for the "AI-suggested
// fixes" the product copy promises, without needing a real model.
function scoreArticle(article, ticket) {
  let score = 0;
  const ticketText = `${ticket.title || ticket.subject || ''} ${ticket.description || ''}`.toLowerCase();
  const articleText = `${article.title} ${article.content}`.toLowerCase();

  if (ticket.category && article.category && ticket.category.toLowerCase() === article.category.toLowerCase()) {
    score += 3;
  }

  const words = new Set(
    ticketText
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 3)
  );
  words.forEach((word) => {
    if (articleText.includes(word)) score += 1;
  });

  return score;
}

export const knowledgeBaseService = {
  getArticles: async () => getArticles(),

  createArticle: async (articleData) => {
    const articles = getArticles();
    const article = { id: `kb-${Date.now()}`, ...articleData };
    saveArticles([...articles, article]);
    return article;
  },

  updateArticle: async (articleId, articleData) => {
    const articles = getArticles();
    const updated = articles.map((a) => (a.id === articleId ? { ...a, ...articleData } : a));
    saveArticles(updated);
    return updated.find((a) => a.id === articleId);
  },

  deleteArticle: async (articleId) => {
    saveArticles(getArticles().filter((a) => a.id !== articleId));
    return { id: articleId };
  },

  // Returns the articles most likely to help resolve the given ticket,
  // best match first. Used for "AI-suggested" help on ticket detail /
  // resolve screens.
  getSuggestedArticles: async (ticket, limit = 3) => {
    if (!ticket) return [];
    const articles = getArticles();
    return articles
      .map((article) => ({ article, score: scoreArticle(article, ticket) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ article }) => article);
  },
};

export default knowledgeBaseService;
