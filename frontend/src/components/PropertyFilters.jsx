import { useState } from "react";

const initialFilters = {
  city: "",
  zipcode: "",
  minPrice: "",
  maxPrice: "",
  beds: "",
  baths: "",
};

export default function PropertyFilters({ onSearch, onClear }) {
  const [filters, setFilters] = useState(initialFilters);

  function handleChange(event) {
    const { name, value } = event.target;
    setFilters((previous) => ({ ...previous, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== "")
    );

    onSearch(activeFilters);
  }

  function handleClear() {
    setFilters(initialFilters);
    onClear();
  }

  return (
    <form className="property-filters" onSubmit={handleSubmit}>
      <label>
        City
        <input name="city" value={filters.city} onChange={handleChange} />
      </label>

      <label>
        ZIP code
        <input name="zipcode" value={filters.zipcode} onChange={handleChange} />
      </label>

      <label>
        Minimum price
        <input
          name="minPrice"
          type="number"
          min="0"
          value={filters.minPrice}
          onChange={handleChange}
        />
      </label>

      <label>
        Maximum price
        <input
          name="maxPrice"
          type="number"
          min="0"
          value={filters.maxPrice}
          onChange={handleChange}
        />
      </label>

      <label>
        Beds
        <select name="beds" value={filters.beds} onChange={handleChange}>
          <option value="">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
          <option value="5">5+</option>
        </select>
      </label>

      <label>
        Baths
        <select name="baths" value={filters.baths} onChange={handleChange}>
          <option value="">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>
      </label>

      <button type="submit">Search</button>
      <button type="button" onClick={handleClear}>
        Clear Filters
      </button>
    </form>
  );
}
