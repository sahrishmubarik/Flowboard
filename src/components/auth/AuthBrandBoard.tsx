const columns = [
  {
    title: "Open",
    count: 6,
    tasks: [
      {
        id: "WEB-151",
        title: "Breadcrumb navigation",
        type: "task",
      },
      {
        id: "WEB-155",
        title: "Footer misaligned on Safari",
        type: "bug",
      },
    ],
  },

  {
    title: "In Progress",
    count: 5,
    tasks: [
      {
        id: "WEB-142",
        title: "Responsive navbar",
        type: "task",
      },
      {
        id: "WEB-147",
        title: "SVG icon sprite",
        type: "task",
      },
    ],
  },

  {
    title: "Testing",
    count: 2,
    tasks: [
      {
        id: "WEB-133",
        title: "Checkout fails on empty coupon",
        type: "bug",
      },
    ],
  },
];

export default function AuthBrandBoard() {
  return (
    <div className="auth-board">
      <div className="auth-board-grid">
        {columns.map((column) => (
          <div key={column.title} className="auth-board-column">
            {/* Column heading */}

            <div className="auth-board-column-header">
              <span>{column.title}</span>

              <span>{column.count}</span>
            </div>

            {/* Tasks */}

            <div className="auth-board-tasks">
              {column.tasks.map((task) => (
                <div
                  key={task.id}
                  className={`auth-task auth-task-${task.type}`}
                >
                  <div className="auth-task-top">
                    <span className="auth-task-icon">
                      {task.type === "bug" ? "!" : "✓"}
                    </span>

                    <span className="auth-task-id">{task.id}</span>
                  </div>

                  <p className="auth-task-title">{task.title}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
