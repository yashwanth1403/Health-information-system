import ResultCard from "./ResultCard";

function ResultsPanel({
  results,
  isSearching,
  selectedDocId,
  onSelectDoc,
  page = 1,
  totalPages = 1,
  totalResults = 0,
  onPageChange,
  canPaginate = false,
  pageSize = 5,
  isCollapsed = false,
  onToggleCollapse,
}) {
  const hasResults = results.length > 0;
  const showPagination =
    canPaginate && !isSearching && totalResults > 0 && totalPages > 1;
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(startIndex + results.length - 1, totalResults);

  return (
    <section className={`results-panel${isCollapsed ? " is-collapsed" : ""}`}>
      <header className="results-panel__header">
        <div className="results-panel__heading">
          <p className="eyebrow">Results</p>
          {totalResults > 0 ? (
            <>
              <h2>{`${totalResults} matching documents`}</h2>
              {hasResults && (
                <p className="result-count-range">
                  Showing {startIndex}-{endIndex}
                </p>
              )}
            </>
          ) : (
            <h2>Your results will appear here</h2>
          )}
        </div>
        <button
          type="button"
          className="results-panel__toggle"
          onClick={onToggleCollapse}
          aria-expanded={!isCollapsed}
          aria-label={
            isCollapsed ? "Expand results panel" : "Collapse results panel"
          }
        >
          {isCollapsed ? "▶" : "◀"}
        </button>
      </header>

      {!isCollapsed && (
        <div className="results-panel__body">
          {showPagination && (
            <div className="pagination-controls pagination-controls--top">
              <button
                type="button"
                className="pagination-btn pagination-btn--prev"
                onClick={() => onPageChange?.(page - 1)}
                disabled={page <= 1 || isSearching}
                aria-label="Previous page"
              >
                <span className="pagination-icon">‹</span>
                <span className="pagination-text">Previous</span>
              </button>
              <div className="pagination-info">
                <span className="pagination-page">
                  Page <strong>{page}</strong> of {totalPages}
                </span>
                <span className="pagination-count">
                  {startIndex}-{endIndex} of {totalResults}
                </span>
              </div>
              <button
                type="button"
                className="pagination-btn pagination-btn--next"
                onClick={() => onPageChange?.(page + 1)}
                disabled={page >= totalPages || isSearching}
                aria-label="Next page"
              >
                <span className="pagination-text">Next</span>
                <span className="pagination-icon">›</span>
              </button>
            </div>
          )}

          {isSearching && (
            <div className="loading-state">
              <div className="spinner" />
              <p>Gathering the most relevant guidance…</p>
            </div>
          )}

          {!isSearching && !hasResults && (
            <div className="empty-state">
              <h3>Need inspiration?</h3>
              <p>
                Try searches like "diabetes treatment", "stroke symptoms", or
                "mental health support".
              </p>
            </div>
          )}

          {!isSearching &&
            hasResults &&
            results.map((item) => (
              <ResultCard
                key={item.id}
                item={item}
                isActive={selectedDocId === item.id}
                onSelect={onSelectDoc}
              />
            ))}
        </div>
      )}
    </section>
  );
}

export default ResultsPanel;
