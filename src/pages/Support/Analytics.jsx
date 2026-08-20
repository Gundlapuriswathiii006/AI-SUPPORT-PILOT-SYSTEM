import React, { useEffect, useState } from "react";
import { ticketService } from "../../services/ticketService";
import Loader from "../../components/common/Loader";

function Analytics() {
  const [tickets, setTickets] = useState([]);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------------
  // FETCH TICKETS
  // ---------------------------------------------------------

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const result = await ticketService.getAllTickets();
        setTickets(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Failed to load analytics:", error);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <Loader text="Loading analytics..." />;
  }

  // ---------------------------------------------------------
  // DATE FILTER
  // ---------------------------------------------------------

  const today = new Date();

  const fromDate = new Date();
  fromDate.setDate(today.getDate() - days);

  // ---------------------------------------------------------
  // RECENT TICKETS
  // ---------------------------------------------------------

  const recentTickets = tickets.filter((ticket) => {
    const date = new Date(
      ticket.createdAtISO || ticket.createdAt
    );

    return date >= fromDate;
  });

  // ---------------------------------------------------------
  // TICKET STATUS
  // ---------------------------------------------------------

  const statusData = [
    {
      name: "Open",
      value: recentTickets.filter(
        (ticket) =>
          ticket.status?.toLowerCase() === "open"
      ).length,
    },

    {
      name: "Pending",
      value: recentTickets.filter(
        (ticket) =>
          ticket.status?.toLowerCase() === "pending"
      ).length,
    },

    {
      name: "Resolved",
      value: recentTickets.filter(
        (ticket) =>
          ticket.status?.toLowerCase() === "resolved"
      ).length,
    },

    {
      name: "Closed",
      value: recentTickets.filter(
        (ticket) =>
          ticket.status?.toLowerCase() === "closed"
      ).length,
    },

    {
      name: "Escalated",
      value: recentTickets.filter(
        (ticket) =>
          ticket.status?.toLowerCase() === "escalated" ||
          ticket.escalated === true
      ).length,
    },
  ];

  // ---------------------------------------------------------
  // TICKET CATEGORIES
  // ---------------------------------------------------------

  const categoryNames = [
    ...new Set(
      recentTickets.map(
        (ticket) => ticket.category || "Other"
      )
    ),
  ];

  const categoryData = categoryNames.map((name) => ({
    name,
    value: recentTickets.filter(
      (ticket) =>
        (ticket.category || "Other") === name
    ).length,
  }));

  // ---------------------------------------------------------
  // PRIORITY
  // ---------------------------------------------------------

  const priorityData = [
    {
      name: "High",
      value: recentTickets.filter(
        (ticket) =>
          ticket.priority?.toLowerCase() === "high"
      ).length,
    },

    {
      name: "Medium",
      value: recentTickets.filter(
        (ticket) =>
          ticket.priority?.toLowerCase() === "medium"
      ).length,
    },

    {
      name: "Low",
      value: recentTickets.filter(
        (ticket) =>
          ticket.priority?.toLowerCase() === "low"
      ).length,
    },

    {
      name: "Critical",
      value: recentTickets.filter(
        (ticket) =>
          ticket.priority?.toLowerCase() === "critical"
      ).length,
    },
  ];

  // ---------------------------------------------------------
  // TODAY'S SUPPORT SUMMARY
  // ---------------------------------------------------------

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(
    todayStart.getDate() + 1
  );

  // Tickets CREATED today

  const ticketsToday = tickets.filter((ticket) => {
    const createdDate = new Date(
      ticket.createdAtISO || ticket.createdAt
    );

    return (
      createdDate >= todayStart &&
      createdDate < tomorrowStart
    );
  });

  const ticketsTodayCount =
    ticketsToday.length;

  // Tickets RESOLVED today
  // Uses resolvedAt from the backend

  const resolvedToday = tickets.filter((ticket) => {
    if (!ticket.resolvedAt) {
      return false;
    }

    const resolvedDate = new Date(
      ticket.resolvedAt
    );

    return (
      resolvedDate >= todayStart &&
      resolvedDate < tomorrowStart
    );
  });

  const resolvedTodayCount =
    resolvedToday.length;

  // Currently escalated tickets

  const escalatedCount = tickets.filter(
    (ticket) =>
      ticket.status?.toLowerCase() ===
        "escalated" ||
      ticket.escalated === true
  ).length;

  // ---------------------------------------------------------
  // BAR WIDTH
  // ---------------------------------------------------------

  const createWidth = (value, data) => {
    const maximum = Math.max(
      ...data.map((item) => item.value),
      1
    );

    if (value === 0) {
      return "3%";
    }

    return `${Math.max(
      (value / maximum) * 100,
      8
    )}%`;
  };

  // ---------------------------------------------------------
  // BAR SECTION
  // ---------------------------------------------------------

  const BarSection = ({ title, data }) => (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "24px",
        boxShadow:
          "0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      <h2
        style={{
          margin: "0 0 28px",
          fontSize: "18px",
          fontWeight: "600",
          color: "var(--text)",
        }}
      >
        {title}
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "22px",
        }}
      >
        {data.length === 0 ? (
          <div
            style={{
              height: "120px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
            }}
          >
            No data available
          </div>
        ) : (
          data.map((item) => (
            <div key={item.name}>
              {/* LABEL */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                  fontSize: "14px",
                  color: "var(--text-muted)",
                }}
              >
                <span>{item.name}</span>

                <span
                  style={{
                    fontWeight: "600",
                    color: "var(--text)",
                  }}
                >
                  {item.value}
                </span>
              </div>

              {/* BAR */}

              <div
                style={{
                  width: "100%",
                  height: "16px",
                  background:
                    "var(--border, #263244)",
                  borderRadius: "20px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: createWidth(
                      item.value,
                      data
                    ),
                    height: "100%",
                    background: "#2684ff",
                    borderRadius: "20px",
                    transition:
                      "width 0.5s ease",
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // ---------------------------------------------------------
  // RETURN
  // ---------------------------------------------------------

  return (
    <div
      style={{
        padding: "24px",
        minHeight: "100%",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: "700",
              color: "var(--text)",
            }}
          >
            Analytics
          </h1>

          <p
            style={{
              margin: "6px 0 0",
              color: "var(--text-muted)",
            }}
          >
            Support activity overview
          </p>
        </div>

        {/* DATE BUTTONS */}

        <div
          style={{
            display: "flex",
            gap: "8px",
          }}
        >
          {[7, 30, 90].map((option) => (
            <button
              key={option}
              onClick={() => setDays(option)}
              style={{
                border: "none",
                borderRadius: "8px",
                padding: "9px 16px",
                cursor: "pointer",
                background:
                  days === option
                    ? "#2684ff"
                    : "var(--border, #263244)",
                color: "#fff",
                fontWeight:
                  days === option
                    ? "600"
                    : "400",
              }}
            >
              {option} Days
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================
          REPORT SECTIONS
          ===================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "20px",
        }}
      >
        {/* STATUS */}

        <BarSection
          title="Ticket Status"
          data={statusData}
        />

        {/* CATEGORIES */}

        <BarSection
          title="Ticket Categories"
          data={categoryData}
        />

        {/* PRIORITY */}

        <BarSection
          title="Priority"
          data={priorityData}
        />
      </div>

      {/* =====================================================
          TODAY'S SUPPORT SUMMARY
          ===================================================== */}

      <div
        style={{
          marginTop: "24px",
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          padding: "24px",
          boxShadow:
            "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <h2
          style={{
            margin: "0 0 20px",
            fontSize: "18px",
            fontWeight: "600",
            color: "var(--text)",
          }}
        >
          Today's Support Summary
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
          }}
        >
          {/* =================================================
              TICKETS TODAY
              ================================================= */}

          <div
            style={{
              padding: "20px",
              borderRadius: "12px",
              background: "#f5f9ff",
              border: "1px solid #dbeafe",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: "var(--text-muted)",
                marginBottom: "8px",
              }}
            >
              Tickets Today
            </div>

            <div
              style={{
                fontSize: "30px",
                fontWeight: "700",
                color: "var(--text)",
              }}
            >
              {ticketsTodayCount}
            </div>
          </div>

          {/* =================================================
              RESOLVED TODAY
              ================================================= */}

          <div
            style={{
              padding: "20px",
              borderRadius: "12px",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: "var(--text-muted)",
                marginBottom: "8px",
              }}
            >
              Resolved Today
            </div>

            <div
              style={{
                fontSize: "30px",
                fontWeight: "700",
                color: "var(--text)",
              }}
            >
              {resolvedTodayCount}
            </div>
          </div>

          {/* =================================================
              ESCALATED
              ================================================= */}

          <div
            style={{
              padding: "20px",
              borderRadius: "12px",
              background: "#fff7ed",
              border: "1px solid #fed7aa",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: "var(--text-muted)",
                marginBottom: "8px",
              }}
            >
              Escalated
            </div>

            <div
              style={{
                fontSize: "30px",
                fontWeight: "700",
                color: "var(--text)",
              }}
            >
              {escalatedCount}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;