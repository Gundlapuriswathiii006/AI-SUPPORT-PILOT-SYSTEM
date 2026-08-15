import React, { useEffect, useState } from 'react';
import jiraService from '../../services/jiraService';
import Loader from '../../components/common/Loader';

function Jira() {
  const [status, setStatus] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [statusData, issuesData] = await Promise.all([
        jiraService.getStatus(),
        jiraService.getIssues(),
      ]);
      setStatus(statusData);
      setIssues(issuesData?.issues || []);
    } catch (err) {
      setError(err.message || 'Could not load JIRA data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Loader text="Loading JIRA data..." />;

  return (
    <div className="jira-panel">
      <div className="section-header">
        <h1>JIRA</h1>
        <span className={`status-badge ${status?.connected ? 'resolved' : 'open'}`}>
          {status?.connected ? 'Connected' : 'Not Connected'}
        </span>
      </div>

      {status && (
        <div className="table-wrapper" style={{ marginBottom: '1rem', padding: '1rem' }}>
          <p style={{ margin: 0 }}>
            <strong>Project:</strong> {status.projectKey || '—'}
            {'  '}
            <strong style={{ marginLeft: '1rem' }}>Base URL:</strong>{' '}
            {status.baseUrl ? (
              <a href={status.baseUrl} target="_blank" rel="noreferrer">{status.baseUrl}</a>
            ) : '—'}
          </p>
        </div>
      )}

      {error && <p className="no-data">{error}</p>}

      <div className="table-wrapper">
        <table className="ticket-table">
          <thead>
            <tr>
              <th>Issue Key</th>
              <th>Summary</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Raised By</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {issues.length > 0 ? (
              issues.map((issue) => (
                <tr key={issue.issueKey || issue.ticketId}>
                  <td>{issue.issueKey}</td>
                  <td>{issue.summary}</td>
                  <td>{issue.category}</td>
                  <td>
                    <span className={`priority-badge ${(issue.priority || '').toLowerCase()}`}>
                      {issue.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${issue.status}`}>{issue.status?.replace('_', ' ')}</span>
                  </td>
                  <td>{issue.raisedBy || 'Unknown'}</td>
                  <td>
                    {issue.issueUrl ? (
                      <a href={issue.issueUrl} target="_blank" rel="noreferrer">Open in JIRA</a>
                    ) : '—'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  No JIRA issues yet. Tickets will appear here once synced.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Jira;
