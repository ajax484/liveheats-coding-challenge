import { render, screen } from "@testing-library/react";
import { useRaceStore } from "@/app/store/raceStore";
import LandingPage from "@/app/page";
import userEvent from "@testing-library/user-event";

jest.mock("@/app/store/raceStore", () => ({
  useRaceStore: jest.fn(),
}));

jest.mock("next/router", () => ({
    useRouter: jest.fn(),
  }));

describe("LandingPage Component", () => {
  const mockRaces = [
    {
      id: "race1",
      title: "City Marathon",
      participants: [
        { id: "p1", name: "John Doe", place: 1 },
        { id: "p2", name: "Jane Smith", place: 2 },
        { id: "p3", name: "Alice Brown", place: 3 },
        { id: "p4", name: "Bob White", place: 4 },
      ],
    },
    {
      id: "race2",
      title: "Beach Run",
      participants: [
        { id: "p5", name: "Tom Green", place: 1 },
        { id: "p6", name: "Jerry Blue", place: 2 },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the landing page with a search input and create button", () => {
    jest.mocked(useRaceStore).mockReturnValue({ races: [] });

    render(<LandingPage />);

    expect(screen.getByPlaceholderText("Search races...")).toBeInTheDocument();

    const buttons = screen.getAllByText("Create A Race");
    buttons.forEach((button) => {
      expect(button).toBeInTheDocument();
    });
  });

  it("displays the message 'No races found' when there are no races", () => {
    jest.mocked(useRaceStore).mockReturnValue({ races: [] });

    render(<LandingPage />);

    expect(screen.getByText("No races found")).toBeInTheDocument();
    expect(
      screen.getByText("You can create a race by clicking on the button below")
    ).toBeInTheDocument();
  });

  it("renders a list of races when races are available", () => {
    jest.mocked(useRaceStore).mockReturnValue({ races: mockRaces });

    render(<LandingPage />);

    expect(screen.getByText("City Marathon")).toBeInTheDocument();
    expect(screen.getByText("Beach Run")).toBeInTheDocument();
  });

  it("renders top 3 participants for each race", () => {
    jest.mocked(useRaceStore).mockReturnValue({ races: mockRaces });

    render(<LandingPage />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Alice Brown")).toBeInTheDocument();
    expect(screen.queryByText("Bob White")).not.toBeInTheDocument();
  });

  it("ensures each race card links to its details page", async () => {
    jest.mocked(useRaceStore).mockReturnValue({ races: mockRaces });
    const user = userEvent.setup();

    render(<LandingPage />);

    const firstRaceLink = screen.getByText("City Marathon").closest("a");
    expect(firstRaceLink).toHaveAttribute("href", "/races/race1");

    const secondRaceLink = screen.getByText("Beach Run").closest("a");
    expect(secondRaceLink).toHaveAttribute("href", "/races/race2");

    await user.click(firstRaceLink);
    
  });

  it("renders medal icons for top 3 participants", () => {
    jest.mocked(useRaceStore).mockReturnValue({ races: mockRaces });

    render(<LandingPage />);

    const goldMedals = screen.getAllByText((content) => content.includes("🥇"));
    const silverMedals = screen.getAllByText((content) =>
      content.includes("🥈")
    );
    const bronzeMedals = screen.getAllByText((content) =>
      content.includes("🥉")
    );

    goldMedals.forEach((medal) => {
      expect(medal).toBeInTheDocument();
    });

    silverMedals.forEach((medal) => {
      expect(medal).toBeInTheDocument();
    });

    bronzeMedals.forEach((medal) => {
      expect(medal).toBeInTheDocument();
    });
  });

  it("search input is rendered and usable", async () => {
    jest.mocked(useRaceStore).mockReturnValue({ races: mockRaces });
    const user = userEvent.setup();

    render(<LandingPage />);

    const searchInput = screen.getByPlaceholderText("Search races...");
    expect(searchInput).toBeInTheDocument();

    await user.type(searchInput, "Marathon");
    expect(searchInput).toHaveValue("Marathon");
  });
});
