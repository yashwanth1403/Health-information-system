import SearchBar from "./SearchBar";

function HeroSection({
  query,
  onQueryChange,
  onSearch,
  isSearching,
  errorMessage,
}) {
  return (
    <div className="hero">
      <p className="eyebrow">Health Knowledge Base</p>
      <h1>Search trusted health information in seconds</h1>
      <p className="subhead">
        Explore curated WHO guidance on chronic diseases, mental health,
        prevention strategies, and more.
      </p>
      <SearchBar
        query={query}
        onQueryChange={onQueryChange}
        onSubmit={onSearch}
        isSearching={isSearching}
      />
      {errorMessage && <p className="inline-error">{errorMessage}</p>}
    </div>
  );
}

export default HeroSection;
