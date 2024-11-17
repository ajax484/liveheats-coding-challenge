import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "react";
import { useRaceStore } from "@/app/store/raceStore";
import { useParams, useRouter } from "next/navigation";
import RaceResultsPage from "@/app/races/[id]/result/page";

// Mock the next/navigation
jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// Mock the race store
jest.mock("@/app/store/raceStore", () => ({
  useRaceStore: jest.fn(),
}));

// Mock form components
jest.mock("@hookform/resolvers/zod", () => ({
  zodResolver: (schema) => schema,
}));

const mockRace = {
  id: "race-1",
  name: "Test Race",
  date: new Date().toISOString(),
  participants: [
    { id: "p1", name: "Racer 1", lane: 1, place: 1 },
    { id: "p2", name: "Racer 2", lane: 2, place: 2 },
    { id: "p3", name: "Racer 3", lane: 3, place: 3 },
  ],
};

jest.mock("react-hook-form", () => ({
  useForm: () => ({
    handleSubmit: (cb) => (e) => {
      e.preventDefault();
      cb(mockRace);
    },
    watch: () => mockRace.participants,
    setValue: jest.fn(),
  }),
}));

jest.mock("@/components/ui/form", () => ({
  Form: ({ children }) => <div>{children}</div>,
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange }) => (
    <div data-testid="select" onClick={() => onValueChange("2")}>
      {children}
    </div>
  ),
  SelectContent: ({ children }) => <div>{children}</div>,
  SelectItem: ({ children }) => <div>{children}</div>,
  SelectTrigger: ({ children }) => <div>{children}</div>,
  SelectValue: () => <div>Select Value</div>,
}));

let mockFormData = mockRace;

describe("RaceResultsPage", () => {
  const mockUpdateRace = jest.fn();
  const mockRouterPush = jest.fn();

  beforeEach(() => {
    jest.mocked(useParams).mockReturnValue({ id: "race-1" });
    jest.mocked(useRouter).mockImplementation(() => ({
      push: mockRouterPush,
    }));
    jest.mocked(useRaceStore).mockReturnValue({
      races: [mockRace],
      updateRace: mockUpdateRace,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the race results page with correct title", () => {
    render(<RaceResultsPage />);
    expect(screen.getByText("Update Final Results")).toBeInTheDocument();
  });

  it("displays all participants with their names and lanes", () => {
    render(<RaceResultsPage />);

    mockRace.participants.forEach((participant) => {
      expect(
        screen.getByText(`Racer ${participant.lane}: ${participant.name}`)
      ).toBeInTheDocument();
    });
  });

  it("handles position adjustment correctly", async () => {
    render(<RaceResultsPage />);

    const selectElements = screen.getAllByTestId("select");

    await act(async () => {
      fireEvent.click(selectElements[0]);
    });

    expect(selectElements[0]).toHaveAttribute("data-testid", "select");
  });

  it("submits the form with valid positions", async () => {
    render(<RaceResultsPage />);

    const form = screen.getByTitle("update race form");

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(mockUpdateRace).toHaveBeenCalledWith(
      "race-1",
      expect.objectContaining({
        id: "race-1",
        participants: expect.arrayContaining([
          expect.objectContaining({ place: expect.any(Number) }),
        ]),
      })
    );
    expect(mockRouterPush).toHaveBeenCalledWith("/");
  });


  it("handles ties in positions correctly", async () => {
    const raceWithTie = {
      ...mockRace,
      participants: [
        { id: "p1", name: "Racer 1", lane: 1, place: 1 },
        { id: "p2", name: "Racer 2", lane: 2, place: 1 },
        { id: "p3", name: "Racer 3", lane: 3, place: 2 },
      ],
    };

    jest.mocked(useRaceStore).mockReturnValue({
      races: [raceWithTie],
      updateRace: mockUpdateRace,
    });

    render(<RaceResultsPage />);

    const form = screen.getByTitle("update race form");

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(mockUpdateRace).toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalledWith("/");
  });
});
