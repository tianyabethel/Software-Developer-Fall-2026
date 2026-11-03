import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Pagination from "./Pagination";

describe("Pagination", () => {
  it("disables Previous on the first page", () => {
    render(
      <Pagination currentPage={1} totalPages={10} onPageChange={vi.fn()} />
    );

    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  });

  it("disables Next on the last page", () => {
    render(
      <Pagination currentPage={10} totalPages={10} onPageChange={vi.fn()} />
    );

    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("allows clicking a page number", () => {
    const onPageChange = vi.fn();

    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />
    );

    fireEvent.click(screen.getByRole("button", { name: "3" }));

    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("shows ellipses when there are many pages", () => {
    render(
      <Pagination currentPage={5} totalPages={24} onPageChange={vi.fn()} />
    );

    expect(screen.getAllByText("...")).toHaveLength(2);
  });

  it("does not duplicate the last page near the end", () => {
    render(
      <Pagination currentPage={22} totalPages={24} onPageChange={vi.fn()} />
    );

    expect(screen.getAllByRole("button", { name: "24" })).toHaveLength(1);
  });

  it("shows the correct page in the middle", () => {
    render(
      <Pagination currentPage={5} totalPages={24} onPageChange={vi.fn()} />
    );

    expect(screen.getByRole("button", { name: "5" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("hides pagination when there is only one page", () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />
    );

    expect(container.firstChild).toBeNull();
  });
});
