import { formatUnixTimestamp } from "../../lib/format";
import type { ExcerptDetail } from "../../types/excerpt";

type ExcerptDetailPanelProps = {
  excerpt: ExcerptDetail;
  onClose: () => void;
};

export function ExcerptDetailPanel({
  excerpt,
  onClose,
}: ExcerptDetailPanelProps) {
  return (
    <aside className="detail-sidebar">
      <div className="detail-sidebar-header">
        <div>
          <p className="detail-sidebar-eyebrow">Excerpt detail</p>
          <h3>{excerpt.sourceTitle}</h3>
          <p className="detail-sidebar-subtitle">
            Quote, citation and analyst context linked to a source.
          </p>
        </div>

        <button className="detail-close-btn" onClick={onClose} type="button">
          ✕
        </button>
      </div>

      <div className="detail-hero-card">
        <span className="excerpt-kind-badge">EXCERPT</span>
        <p className="detail-hero-text">
          This is the foundation for evidence capture, citations and future dossier building.
        </p>
      </div>

      <div className="detail-section">
        <p className="detail-label">Citation</p>
        <p className="detail-value">{excerpt.citationText}</p>
      </div>

      <div className="detail-section">
        <p className="detail-label">Excerpt text</p>
        <blockquote className="detail-quote-block">
          {excerpt.excerptText}
        </blockquote>
      </div>

      {excerpt.note ? (
        <div className="detail-section">
          <p className="detail-label">Analyst note</p>
          <p className="detail-value">{excerpt.note}</p>
        </div>
      ) : null}

      <div className="detail-grid">
        <div className="detail-mini-card">
          <p className="detail-label">Source kind</p>
          <p className="detail-value">{excerpt.sourceKind.toUpperCase()}</p>
        </div>

        <div className="detail-mini-card">
          <p className="detail-label">Topics</p>
          <p className="detail-value">{excerpt.topicNames || "Inbox"}</p>
        </div>

        <div className="detail-mini-card">
          <p className="detail-label">Location</p>
          <p className="detail-value">{excerpt.pageLabel || "—"}</p>
        </div>

        <div className="detail-mini-card">
          <p className="detail-label">Created</p>
          <p className="detail-value">{formatUnixTimestamp(excerpt.createdAt)}</p>
        </div>

        <div className="detail-mini-card">
          <p className="detail-label">Updated</p>
          <p className="detail-value">{formatUnixTimestamp(excerpt.updatedAt)}</p>
        </div>
      </div>
    </aside>
  );
}