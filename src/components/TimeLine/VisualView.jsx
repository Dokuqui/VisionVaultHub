function VisualView({ timeline, minDate, daysBetween }) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "1rem",
        borderRadius: "12px",
        overflowX: "auto",
      }}
    >
      {timeline.map((item, i) => {
        const offsetDays = daysBetween(item.date, minDate);
        return (
          <div
            key={i}
            style={{
              marginBottom: "1.5rem",
              position: "relative",
            }}
          >
            <div
              style={{
                fontWeight: "600",
                marginBottom: "0.25rem",
              }}
            >
              {item.title} ({item.date})
            </div>
            <div
              style={{
                height: "24px",
                backgroundColor: "#007bff",
                borderRadius: "12px",
                width: "80px",
                marginLeft: `${offsetDays * 20}px`,
                transition: "margin-left 0.3s ease",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.85rem",
              }}
            >
              Milestone
            </div>

            {(item.subMilestones || []).map((sub, si) => {
              const subOffset = daysBetween(sub.date, minDate);
              return (
                <div
                  key={si}
                  style={{
                    height: "18px",
                    backgroundColor: "#28a745",
                    borderRadius: "10px",
                    width: "60px",
                    marginLeft: `${subOffset * 20}px`,
                    marginTop: "6px",
                    color: "#fff",
                    fontSize: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title={`${sub.title} (${sub.date})`}
                >
                  Sub
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default VisualView;
