import { useMemo, useState } from "react";
import "./App.css";
import HeroSection from "./components/HeroSection";
import ResultsPanel from "./components/ResultsPanel";
import DetailsPanel from "./components/DetailsPanel";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:4000";
const RESULTS_PER_PAGE = 5;

const containsHighlightMarkup = (value) =>
  typeof value === "string" && /<\/?mark>/i.test(value);

const buildHighlightPayload = (item = {}, docHighlight = {}) => {
  const listSnippet =
    item.highlight?.snippet ||
    (containsHighlightMarkup(item.snippet) ? item.snippet : null) ||
    null;

  const bodyHighlight =
    docHighlight?.body || docHighlight?.snippet || listSnippet;

  return {
    title:
      docHighlight?.title ||
      item.highlight?.title ||
      (containsHighlightMarkup(item.title) ? item.title : null),
    snippet: docHighlight?.snippet || listSnippet,
    body: bodyHighlight,
    tags: docHighlight?.tags || item.highlight?.tags || [],
  };
};

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [activeQuery, setActiveQuery] = useState("");
  const [isResultsCollapsed, setIsResultsCollapsed] = useState(false);

  const canPaginate = useMemo(
    () => totalResults > RESULTS_PER_PAGE,
    [totalResults]
  );

  const fetchResults = async (searchQuery, pageNumber = 1) => {
    const url = new URL(`${API_BASE}/search`);
    url.searchParams.set("q", searchQuery);
    url.searchParams.set("page", pageNumber);
    url.searchParams.set("limit", RESULTS_PER_PAGE);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Search failed. Please try again.");
    }

    const data = await response.json();

    setResults(data.results || []);
    setPage(data.page || 1);
    setTotalPages(data.totalPages || 1);
    setTotalResults(data.total || 0);

    return data;
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError("Please enter a keyword or phrase to search.");
      return;
    }

    // Automatically expand results panel if collapsed
    if (isResultsCollapsed) {
      setIsResultsCollapsed(false);
    }

    setIsSearching(true);
    setError("");
    setSelectedDoc(null);

    try {
      const data = await fetchResults(trimmedQuery, 1);
      setActiveQuery(trimmedQuery);

      if ((data.results || []).length === 0) {
        setError("No documents matched your search. Try another keyword.");
      }
    } catch (err) {
      setError(err.message || "Unable to fetch search results.");
    } finally {
      setIsSearching(false);
    }
  };

  const handlePageChange = async (nextPage) => {
    if (
      nextPage === page ||
      nextPage < 1 ||
      nextPage > totalPages ||
      !activeQuery
    ) {
      return;
    }

    setIsSearching(true);
    setError("");

    try {
      await fetchResults(activeQuery, nextPage);
    } catch (err) {
      setError(err.message || "Unable to fetch search results.");
    } finally {
      setIsSearching(false);
    }
  };

  const openDocument = async (item) => {
    setIsLoadingDoc(true);
    setError("");

    try {
      const docUrl = new URL(`${API_BASE}/search/${item.id}`);
      const effectiveQuery = activeQuery?.trim() || query.trim();

      if (effectiveQuery) {
        docUrl.searchParams.set("q", effectiveQuery);
      }

      const response = await fetch(docUrl);

      if (!response.ok) {
        throw new Error("We couldn't load that document. Please try again.");
      }

      const payload = await response.json();
      const docData = payload.data || payload;
      const docHighlight = payload.highlight || {};

      setSelectedDoc({
        id: item.id,
        data: docData,
        highlight: buildHighlightPayload(item, docHighlight),
      });
    } catch (err) {
      setError(err.message || "Unable to load document details.");
    } finally {
      setIsLoadingDoc(false);
    }
  };

  return (
    <div className="app-shell">
      <HeroSection
        query={query}
        onQueryChange={setQuery}
        onSearch={handleSearch}
        isSearching={isSearching}
        errorMessage={error}
      />
      <div
        className={`content-grid${
          isResultsCollapsed ? " sidebar-collapsed" : ""
        }`}
      >
        <ResultsPanel
          results={results}
          isSearching={isSearching}
          selectedDocId={selectedDoc?.id}
          onSelectDoc={openDocument}
          page={page}
          totalPages={totalPages}
          totalResults={totalResults}
          onPageChange={handlePageChange}
          canPaginate={canPaginate}
          pageSize={RESULTS_PER_PAGE}
          isCollapsed={isResultsCollapsed}
          onToggleCollapse={() => setIsResultsCollapsed((prev) => !prev)}
        />
        <DetailsPanel selectedDoc={selectedDoc} isLoadingDoc={isLoadingDoc} />
      </div>
    </div>
  );
}

export default App;
