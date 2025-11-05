import { useSearchLogic } from "./SearchLogic";
import { SearchView } from "./SearchView";

const Search = () => {
  const logic = useSearchLogic();

  return (
    <SearchView
      input={logic.input}
      setInput={logic.setInput}
      comics={logic.comics}
      loading={logic.loading}
      hasSearched={logic.hasSearched}
      query={logic.query}
      onSearch={logic.handleSearch}
      onNavigate={logic.handleNavigate}
    />
  );
};

export default Search;
