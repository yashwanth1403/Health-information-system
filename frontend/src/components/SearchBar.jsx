function SearchBar({ query, onQueryChange, onSubmit, isSearching }) {
  return (
    <form className="search-bar" onSubmit={onSubmit}>
      <input
        type="text"
        placeholder="Search conditions, symptoms, treatments…"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        aria-label="Search documents"
      />
      <button type="submit" disabled={isSearching}>
        {isSearching ? "Searching…" : "Search"}
      </button>
    </form>
  );
}

export default SearchBar;
