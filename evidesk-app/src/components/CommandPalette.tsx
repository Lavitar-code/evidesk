import { useEffect, useMemo, useState } from "react";

export type CommandPaletteItem = {
  id: string;
  title: string;
  subtitle?: string;
  keywords?: string;
  section: string;
  onSelect: () => void;
};

type CommandPaletteProps = {
  isOpen: boolean;
  items: CommandPaletteItem[];
  onClose: () => void;
};

export function CommandPalette({
  isOpen,
  items,
  onClose,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return items;
    }

    return items.filter((item) => {
      const haystack = [
        item.title,
        item.subtitle ?? "",
        item.section,
        item.keywords ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [items, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((current) =>
          filteredItems.length === 0 ? 0 : Math.min(current + 1, filteredItems.length - 1),
        );
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((current) => Math.max(current - 1, 0));
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const selectedItem = filteredItems[selectedIndex];
        if (selectedItem) {
          selectedItem.onSelect();
          onClose();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredItems, isOpen, onClose, selectedIndex]);

  if (!isOpen) {
    return null;
  }

  let previousSection = "";

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div
        className="command-palette-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="command-palette-header">
          <input
            autoFocus
            className="command-palette-input"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search views, topics, actions..."
            type="text"
            value={query}
          />
          <button className="command-palette-close" onClick={onClose} type="button">
            Esc
          </button>
        </div>

        <div className="command-palette-results">
          {filteredItems.length === 0 ? (
            <div className="command-palette-empty">
              <strong>No results</strong>
              <p>Try another keyword.</p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const showSection = item.section !== previousSection;
              previousSection = item.section;

              return (
                <div key={item.id}>
                  {showSection ? (
                    <div className="command-palette-section">{item.section}</div>
                  ) : null}

                  <button
                    className={`command-palette-item ${
                      index === selectedIndex ? "is-active" : ""
                    }`}
                    onClick={() => {
                      item.onSelect();
                      onClose();
                    }}
                    type="button"
                  >
                    <div className="command-palette-copy">
                      <strong>{item.title}</strong>
                      {item.subtitle ? <p>{item.subtitle}</p> : null}
                    </div>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}