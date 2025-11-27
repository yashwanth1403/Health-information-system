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
      <h1>Health Information Search System</h1>
      <p className="sdg-tagline">
        Supporting SDG 3: Good Health and Well-Being
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
