type ActionListProps = {
  items: string[];
};

export function ActionList({ items }: ActionListProps) {
  return (
    <div className="stack-list">
      {items.map((item) => (
        <button className="action-card" key={item} type="button">
          {item}
        </button>
      ))}
    </div>
  );
}