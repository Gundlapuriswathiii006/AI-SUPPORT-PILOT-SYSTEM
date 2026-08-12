import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { ticketService } from '../../services/ticketService';
import { knowledgeBaseService } from '../../services/knowledgeBaseService';
import { emailService } from '../../services/emailService';
import aiService from '../../services/aiService';
import { useAuth } from '../../hooks/useAuth';

import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

function ResolveTicket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [customerEmail, setCustomerEmail] = useState('');
  const [suggestedArticles, setSuggestedArticles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('resolved');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [reply, setReply] = useState('');
  const [generatingReply, setGeneratingReply] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  // Removes accidental spaces before sending or displaying the email.
  const recipientEmail = customerEmail.trim();

  useEffect(() => {
    let isMounted = true;

    const loadTicket = async () => {
      try {
        const found = await ticketService.getTicketById(id);

        if (!isMounted) {
          return;
        }

        setTicket(found);
        setCustomerEmail(found?.customerEmail || '');
        setStatus(found?.status || 'resolved');
        setResolutionNotes(found?.resolutionNotes || '');

        if (found) {
          const articles =
            await knowledgeBaseService.getSuggestedArticles(found);

          if (isMounted) {
            setSuggestedArticles(articles || []);
          }
        }
      } catch (error) {
        console.error('Failed to load ticket:', error);
        toast.error('Could not load the ticket.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTicket();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleGenerateReply = async () => {
    if (!recipientEmail) {
      toast.error('Please enter the customer email address first.');
      return;
    }

    setGeneratingReply(true);

    try {
      const generatedReply = await aiService.generateReply(ticket);
      setReply(generatedReply);
      toast.success('AI draft ready for your review.');
    } catch (error) {
      console.error('Failed to generate reply:', error);
      toast.error('Could not generate a reply.');
    } finally {
      setGeneratingReply(false);
    }
  };

  const handleSendReply = async (event) => {
    event.preventDefault();

    if (!recipientEmail) {
      toast.error('Please enter the customer email address.');
      return;
    }

    if (!reply.trim()) {
      toast.error('Write a reply or generate an AI draft first.');
      return;
    }

    setSendingReply(true);

    try {
      const result = await emailService.sendTicketReply({
        to: recipientEmail,
        subject: `Re: ${
          ticket.title ||
          ticket.subject ||
          `Ticket #${ticket.id}`
        }`,
        message: reply.trim(),
        ticketId: ticket.id,
        type: 'ticket-reply',
      });

      const updatedTicket = await ticketService.addConversationMessage(
        ticket.id,
        {
          direction: 'outbound',
          channel: 'email',
          sender: user?.email || 'Support agent',
          recipient: recipientEmail,
          body: reply.trim(),
          deliveryMode: result.mode,
        }
      );

      setTicket(updatedTicket);
      setCustomerEmail(
        updatedTicket?.customerEmail || recipientEmail
      );
      setReply('');

      toast.success(`Email sent to ${recipientEmail}.`);
    } catch (error) {
      console.error('Failed to send reply:', error);

      toast.error(
        error.message || 'Could not send the customer email.'
      );
    } finally {
      setSendingReply(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!recipientEmail) {
      toast.error('Please enter the customer email address.');
      return;
    }

    if (!resolutionNotes.trim()) {
      toast.error('Please add resolution notes.');
      return;
    }

    setSubmitting(true);

    try {
      const emailMessage = [
        'Your support ticket has been resolved.',
        '',
        'Resolution details:',
        resolutionNotes.trim(),
        '',
        `Ticket number: #${ticket.id}`,
      ].join('\n');

      // Send the real email first.
      await emailService.sendTicketReply({
        to: recipientEmail,
        subject: `Ticket #${ticket.id} resolved`,
        message: emailMessage,
        ticketId: ticket.id,
        type: 'ticket-resolved',
      });

      // Save the resolution only after the email is sent successfully.
      await ticketService.resolveTicket(id, {
        status,
        resolutionNotes: resolutionNotes.trim(),
        customerEmail: recipientEmail,
      });

      toast.success(
        `Ticket resolved and email sent to ${recipientEmail}.`
      );

      navigate('/support/tickets');
    } catch (error) {
      console.error('Failed to resolve ticket:', error);

      toast.error(
        error.message ||
          'The ticket was not resolved because the email could not be sent.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader text="Loading ticket..." />;
  }

  if (!ticket) {
    return (
      <div className="knowledge-base">
        <p className="no-data">Ticket not found.</p>

        <Button
          variant="secondary"
          onClick={() => navigate('/support/tickets')}
        >
          ← Back to All Tickets
        </Button>
      </div>
    );
  }

  return (
    <div className="knowledge-base">
      <div className="section-header">
        <h1>Resolve Ticket #{ticket.id}</h1>
      </div>

      <div
        className="kb-card"
        style={{ marginBottom: '1.5rem' }}
      >
        <h3>{ticket.title || ticket.subject}</h3>

        <p className="kb-category">
          {ticket.category} · Raised by{' '}
          {ticket.raisedBy || 'Unknown'}
        </p>

        <p className="kb-excerpt">
          {ticket.description}
        </p>
      </div>

      <section className="sp-card sp-conversation-card">
        <div className="sp-card-heading">
          <div>
            <span className="sp-eyebrow">
              Customer communication
            </span>

            <h2>Conversation timeline</h2>
          </div>

          <span
            className={`sp-delivery-pill ${
              recipientEmail ? 'ready' : 'missing'
            }`}
          >
            {recipientEmail
              ? `Email: ${recipientEmail}`
              : 'Customer email missing'}
          </span>
        </div>

        <div className="sp-conversation">
          {(ticket.conversation || []).map((message) => (
            <article
              key={message.id}
              className={`sp-message ${message.direction}`}
            >
              <div className="sp-message-meta">
                <strong>
                  {message.direction === 'outbound'
                    ? 'Support team'
                    : message.sender || 'Customer'}
                </strong>

                <span>
                  {message.channel === 'email'
                    ? 'Email'
                    : 'Portal'}{' '}
                  ·{' '}
                  {new Date(
                    message.createdAt
                  ).toLocaleString()}
                </span>
              </div>

              <p>{message.body}</p>
            </article>
          ))}
        </div>

        <form
          className="sp-reply-composer"
          onSubmit={handleSendReply}
        >
          <div className="sp-composer-heading">
            <label htmlFor="customer-reply">
              Reply to{' '}
              {recipientEmail ||
                'customer email unavailable'}
            </label>

            <button
              type="button"
              className="sp-ai-button"
              onClick={handleGenerateReply}
              disabled={
                generatingReply || !recipientEmail
              }
            >
              {generatingReply
                ? 'Generating…'
                : '✦ Generate AI Reply'}
            </button>
          </div>

          <textarea
            id="customer-reply"
            value={reply}
            onChange={(event) =>
              setReply(event.target.value)
            }
            placeholder="Write a reply to the customer. AI drafts remain editable until you send them."
            rows={5}
            disabled={!recipientEmail || sendingReply}
          />

          <div className="sp-composer-footer">
            <span>
              AI suggestions are never sent without your
              approval.
            </span>

            <Button
              type="submit"
              disabled={
                sendingReply || !recipientEmail
              }
            >
              {sendingReply
                ? 'Sending…'
                : 'Send email reply'}
            </Button>
          </div>
        </form>
      </section>

      {suggestedArticles.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text)',
              marginBottom: '0.75rem',
            }}
          >
            AI-suggested articles for this ticket
          </h2>

          <div className="kb-list">
            {suggestedArticles.map((article) => (
              <div
                key={article.id}
                className="kb-card"
              >
                <h3>{article.title}</h3>

                <p className="kb-category">
                  {article.category}
                </p>

                <p className="kb-excerpt">
                  {article.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="settings-form"
      >
        <div className="sp-input-group">
          <label htmlFor="customerEmail">
            Customer email address
          </label>

          <input
            id="customerEmail"
            name="customerEmail"
            type="email"
            value={customerEmail}
            onChange={(event) =>
              setCustomerEmail(event.target.value)
            }
            placeholder="customer@example.com"
            disabled={submitting}
            required
          />

          <small>
            The resolution email will be sent to this
            address.
          </small>
        </div>

        <div className="sp-input-group">
          <label htmlFor="status">Status</label>

          <select
            id="status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            disabled={submitting}
          >
            <option value="resolved">Resolved</option>
            <option value="in_progress">
              Pending Review
            </option>
            <option value="open">
              Needs Follow-up
            </option>
          </select>
        </div>

        <div className="sp-input-group">
          <label htmlFor="resolutionNotes">
            Resolution Notes
          </label>

          <textarea
            id="resolutionNotes"
            rows={5}
            value={resolutionNotes}
            onChange={(event) =>
              setResolutionNotes(event.target.value)
            }
            placeholder="Summarize what was done to resolve this ticket..."
            disabled={submitting}
            required
          />
        </div>

        <div className="modal-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              navigate('/support/tickets')
            }
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? 'Sending email…'
              : 'Save Resolution'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ResolveTicket;