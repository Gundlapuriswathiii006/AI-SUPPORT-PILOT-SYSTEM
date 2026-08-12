import React, { useEffect, useMemo, useState } from 'react';
import { knowledgeBaseService } from '../../services/knowledgeBaseService';
import Loader from '../../components/common/Loader';
import Input from '../../components/common/Input';

function KnowledgeBase() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    knowledgeBaseService.getArticles()
      .then(setArticles)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter(
      (a) => a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)
    );
  }, [articles, search]);

  if (loading) return <Loader text="Loading knowledge base..." />;

  return (
    <div className="knowledge-base">
      <div className="section-header">
        <h1>Knowledge Base</h1>
      </div>

      <Input
        placeholder="Search articles by title, category, or keyword..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="kb-list" style={{ marginTop: '1.25rem' }}>
        {filtered.length > 0 ? (
          filtered.map((article) => (
            <div key={article.id} className="kb-card">
              <h3>{article.title}</h3>
              <p className="kb-category">{article.category}</p>
              <p className="kb-excerpt">{article.content}</p>
            </div>
          ))
        ) : (
          <p className="no-data">No articles match your search.</p>
        )}
      </div>
    </div>
  );
}

export default KnowledgeBase;
