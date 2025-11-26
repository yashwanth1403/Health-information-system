const HighlightText = ({
  html,
  fallback = "",
  as: Tag = "span",
  className,
}) => {
  const content = html || fallback;
  if (!content) return null;

  const hasHighlight = /<\/?mark>/i.test(content);

  if (hasHighlight) {
    return (
      <Tag
        className={className}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return <Tag className={className}>{content}</Tag>;
};

function ResultCard({ item, isActive, onSelect }) {
  return (
    <button
      className={`result-card ${isActive ? "active" : ""}`}
      onClick={() => onSelect(item)}
    >
      <div className="result-card__header">
        <div>
          <p className="result-category">{item.category}</p>
          <HighlightText as="h3" html={item.title} />
        </div>
      </div>
      <HighlightText as="p" className="result-snippet" html={item.snippet} />
      <div className="result-meta">
        <div className="tags">
          {(item.tags || []).slice(0, 3).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
    </button>
  );
}

export default ResultCard;
