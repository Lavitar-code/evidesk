CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  due_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  archived_at TEXT
);

CREATE TABLE IF NOT EXISTS task_topics (
  task_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  linked_at TEXT NOT NULL,
  PRIMARY KEY (task_id, topic_id),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tasks_status
ON tasks(status);

CREATE INDEX IF NOT EXISTS idx_tasks_priority
ON tasks(priority);

CREATE INDEX IF NOT EXISTS idx_tasks_updated_at
ON tasks(updated_at);

CREATE INDEX IF NOT EXISTS idx_task_topics_topic_id
ON task_topics(topic_id);

CREATE INDEX IF NOT EXISTS idx_task_topics_task_id
ON task_topics(task_id);