import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useRaceStore } from "@/app/store/raceStore";
import { useParams } from "next/navigation";
import RaceDetailsPage from "@/app/races/[id]/page";

// Mock the dependencies
jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

jest.mock("@/app/store/raceStore", () => ({
  useRaceStore: jest.fn(),
}));

// Mock Link component
jest.mock("next/link", () => {
  return ({ children, href }) => <a href={href}>{children}</a>;
});

describe("RaceDetailsPage", () => {
  const mockRace = {
    id: "1",
    title: "Test Race",
    participants: [
      { id: "1", name: "john doe", place: 1 },
      { id: "2", name: "jane smith", place: 2 },
      { id: "3", name: "bob wilson", place: 3 },
      { id: "4", name: "alice brown", place: 4 },
    ],
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  test("renders race not found message when race doesnt exist", () => {
    jest.mocked(useParams).mockReturnValue({ id: "999" });
    jest.mocked(useRaceStore).mockReturnValue({ races: [] });

    render(<RaceDetailsPage />);
    expect(screen.getByText("Race not found")).toBeInTheDocument();
  });

  test("renders race details correctly when race exists", () => {
    jest.mocked(useParams).mockReturnValue({ id: "1" });
    jest.mocked(useRaceStore).mockReturnValue({ races: [mockRace] });

    render(<RaceDetailsPage />);

    // Check title
    expect(screen.getByText("Test Race")).toBeInTheDocument();
    expect(screen.getByText("Race Results")).toBeInTheDocument();

    // Check table headers
    expect(screen.getByText("Position")).toBeInTheDocument();
    expect(screen.getByText("Participant Name")).toBeInTheDocument();
  });

  test("displays participants in correct order with proper medals", () => {
    jest.mocked(useParams).mockReturnValue({ id: "1" });
    jest.mocked(useRaceStore).mockReturnValue({ races: [mockRace] });

    render(<RaceDetailsPage />);

    expect(screen.getByText(/🥇 1st/i)).toBeInTheDocument();
    expect(screen.getByText(/🥈 2nd/i)).toBeInTheDocument();
    expect(screen.getByText(/🥉 3rd/i)).toBeInTheDocument();
    expect(screen.getByText(/4th/i)).toBeInTheDocument();

    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
    expect(screen.getByText(/Bob Wilson/i)).toBeInTheDocument();
    expect(screen.getByText(/Alice Brown/i)).toBeInTheDocument();
  });

  test("back button links to home page", () => {
    jest.mocked(useParams).mockReturnValue({ id: "1" });
    jest.mocked(useRaceStore).mockReturnValue({ races: [mockRace] });

    render(<RaceDetailsPage />);

    const backButton = screen.getByText("Back to Races");
    expect(backButton).toBeInTheDocument();
    expect(backButton.closest("a")).toHaveAttribute("href", "/");
  });

  test("sorts participants by place", () => {
    const unsortedRace = {
      ...mockRace,
      participants: [
        { id: "1", name: "john doe", place: 4 },
        { id: "2", name: "jane smith", place: 1 },
        { id: "3", name: "bob wilson", place: 3 },
        { id: "4", name: "alice brown", place: 2 },
      ],
    };

    jest.mocked(useParams).mockReturnValue({ id: "1" });
    jest.mocked(useRaceStore).mockReturnValue({ races: [unsortedRace] });

    render(<RaceDetailsPage />);

    const rows = screen.getAllByRole("row");
    // First row is header, so we start from index 1
    expect(rows[1]).toHaveTextContent(/🥇 1st/i);
    expect(rows[1]).toHaveTextContent(/Jane Smith/i);
    expect(rows[2]).toHaveTextContent(/🥈 2nd/i);
    expect(rows[2]).toHaveTextContent(/Alice Brown/i);
    expect(rows[3]).toHaveTextContent(/🥉 3rd/i);
    expect(rows[3]).toHaveTextContent(/Bob Wilson/i);
    expect(rows[4]).toHaveTextContent(/4th/i);
    expect(rows[4]).toHaveTextContent(/John Doe/i);
  });

  test("applies highlight styling to top 3 positions", () => {
    jest.mocked(useParams).mockReturnValue({ id: "1" });
    jest.mocked(useRaceStore).mockReturnValue({ races: [mockRace] });

    render(<RaceDetailsPage />);

    const rows = screen.getAllByRole("row");
    // Skip header row
    for (let i = 1; i <= 3; i++) {
      expect(rows[i]).toHaveClass("bg-yellow-100");
    }
    expect(rows[4]).not.toHaveClass("bg-yellow-100");
  });
});
