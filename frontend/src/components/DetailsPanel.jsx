import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

const markdownSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), "mark"],
  attributes: {
    ...defaultSchema.attributes,
    mark: [...(defaultSchema.attributes?.mark || []), ["className"], ["id"]],
  },
};

function MarkdownBody({ content }) {
  if (!content) return null;

  return (
    <div className="doc-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, markdownSchema]]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function DetailsPanel({ selectedDoc, isLoadingDoc }) {
  return (
    <section className="details-panel">
      {!selectedDoc && !isLoadingDoc && (
        <div className="empty-details">
          <h3>No document selected</h3>
          <p>Choose a result to read full WHO guidance.</p>
        </div>
      )}

      {isLoadingDoc && (
        <div className="loading-details">
          <div className="spinner" />
          <p>Loading document…</p>
        </div>
      )}

      {selectedDoc && !isLoadingDoc && (
        <div className="details-panel__scroll">
          <article>
            <header className="details-header">
              <div>
                <p className="eyebrow">{selectedDoc.data.category}</p>
                {selectedDoc.highlight?.title ? (
                  <h2
                    dangerouslySetInnerHTML={{
                      __html: selectedDoc.highlight.title,
                    }}
                  />
                ) : (
                  <h2>{selectedDoc.data.title}</h2>
                )}
                <p className="doc-source">
                  {selectedDoc.data.source} · {selectedDoc.data.year}
                </p>
              </div>
              {selectedDoc.data.url && (
                <a
                  href={selectedDoc.data.url}
                  target="_blank"
                  rel="noreferrer"
                  className="doc-link doc-link--minimal"
                  aria-label="Open WHO reference"
                >
                  View
                </a>
              )}
            </header>

            {selectedDoc.highlight?.body || selectedDoc.highlight?.snippet ? (
              <MarkdownBody
                content={
                  selectedDoc.highlight.body || selectedDoc.highlight.snippet
                }
              />
            ) : (
              <MarkdownBody content={selectedDoc.data.body} />
            )}

            <footer className="doc-footer">
              <p>Tags</p>
              <div className="tags">
                {selectedDoc.data.tags?.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </footer>
          </article>
        </div>
      )}
    </section>
  );
}

export default DetailsPanel;
