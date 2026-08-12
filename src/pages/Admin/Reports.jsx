import React, { useEffect, useState } from "react";
import adminService from "../../services/adminService";
import Loader from "../../components/common/Loader";

function Reports() {
  const [tickets, setTickets] = useState([]);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const result = await adminService.getAllTickets();
        setTickets(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error(error);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return <Loader text="Loading reports..." />;
  }

  const today = new Date();
  const fromDate = new Date();
  fromDate.setDate(today.getDate() - days);

  const recentTickets = tickets.filter((ticket) => {
    const date = new Date(ticket.createdAtISO || ticket.createdAt);
    return date >= fromDate;
  });

  const statusData = [
    {
      name: "Open",
      value: recentTickets.filter(
        (ticket) => ticket.status?.toLowerCase() === "open"
      ).length,
    },
    {
      name: "Pending",
      value: recentTickets.filter(
        (ticket) => ticket.status?.toLowerCase() === "pending"
      ).length,
    },
    {
      name: "Resolved",
      value: recentTickets.filter(
        (ticket) => ticket.status?.toLowerCase() === "resolved"
      ).length,
    },
    {
      name: "Closed",
      value: recentTickets.filter(
        (ticket) => ticket.status?.toLowerCase() === "closed"
      ).length,
    },
  ];

  const categoryNames = [
    ...new Set(
      recentTickets.map((ticket) => ticket.category || "Other")
    ),
  ];

  const categoryData = categoryNames.map((name) => ({
    name,
    value: recentTickets.filter(
      (ticket) => (ticket.category || "Other") === name
    ).length,
  }));

  const priorityData = [
    {
      name: "High",
      value: recentTickets.filter(
        (ticket) => ticket.priority?.toLowerCase() === "high"
      ).length,
    },
    {
      name: "Medium",
      value: recentTickets.filter(
        (ticket) => ticket.priority?.toLowerCase() === "medium"
      ).length,
    },
    {
      name: "Low",
      value: recentTickets.filter(
        (ticket) => ticket.priority?.toLowerCase() === "low"
      ).length,
    },
  ];

  const createWidth = (value, data) => {
    const maximum = Math.max(...data.map((item) => item.value), 1);

    if (value === 0) return "3%";

    return `${Math.max((value / maximum) * 100, 8)}%`;
  };

  const BarSection = ({ title, data }) => (
  <div
    style={{
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "16px",
      padding: "24px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
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
              <div
                style={{
                  marginBottom: "8px",
                  fontSize: "14px",
                  color: "var(--text-muted)",
                }}
              >
                {item.name}
              </div>

              <div
                style={{
                  width: "100%",
                  height: "16px",
                  background: "var(--border, #263244)",
                  borderRadius: "20px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: createWidth(item.value, data),
                    height: "100%",
                    background: "#2684ff",
                    borderRadius: "20px",
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

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
            Reports
          </h1>

          <p
            style={{
              margin: "6px 0 0",
              color: "var(--text-muted)",
            }}
          >
            Ticket activity overview
          </p>
        </div>

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
              }}
            >
              {option} Days
            </button>
          ))}
        </div>
      </div>

      {/* REPORTS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "20px",
        }}
      >
        <BarSection
          title="Ticket Status"
          data={statusData}
        />

        <BarSection
          title="Ticket Categories"
          data={categoryData}
        />

        <BarSection
          title="Priority"
          data={priorityData}
        />
      </div>
    </div>
  );
}

export default Reports;
