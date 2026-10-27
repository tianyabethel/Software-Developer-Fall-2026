import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PropertyFilters from "./PropertyFilters";

describe("PropertyFilters", () => {
  it("renders all six filter fields", () => {
    render(<PropertyFilters onSearch={vi.fn()} onClear={vi.fn()} />);

    expect(screen.getByLabelText("City")).toBeInTheDocument();
    expect(screen.getByLabelText("ZIP code")).toBeInTheDocument();
    expect(screen.getByLabelText("Minimum price")).toBeInTheDocument();
    expect(screen.getByLabelText("Maximum price")).toBeInTheDocument();
    expect(screen.getByLabelText("Beds")).toBeInTheDocument();
    expect(screen.getByLabelText("Baths")).toBeInTheDocument();
  });

  it("submits selected filters without empty values", () => {
    const onSearch = vi.fn();
    render(<PropertyFilters onSearch={onSearch} onClear={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("City"), {
      target: { value: "Blythe" },
    });
    fireEvent.change(screen.getByLabelText("Minimum price"), {
      target: { value: "100000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(onSearch).toHaveBeenCalledWith({
      city: "Blythe",
      minPrice: "100000",
    });
  });

  it("clears the form and calls onClear", () => {
    const onClear = vi.fn();
    render(<PropertyFilters onSearch={vi.fn()} onClear={onClear} />);

    fireEvent.change(screen.getByLabelText("City"), {
      target: { value: "Blythe" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Clear Filters" }));

    expect(screen.getByLabelText("City")).toHaveValue("");
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
