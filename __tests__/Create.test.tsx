import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRaceStore } from "@/app/store/raceStore";
import { useRouter } from "next/navigation";
import CreateRacePage from "@/app/races/create/page";
import next from "next";

// Mock the next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock the race store
jest.mock("@/app/store/raceStore", () => ({
  useRaceStore: jest.fn(),
}));

// Mock generateId to return predictable values in sequence
const mockIds = ["p1", "p2", "p3", "p4"];
let idCounter = 0;
jest.mock("@/app/utils/helper", () => ({
  generateId: jest.fn(() => mockIds[idCounter++]),
}));

describe("CreateRacePage", () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockAddRace = jest.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    jest.mocked(useRouter).mockReturnValue(mockRouter);
    jest.mocked(useRaceStore).mockReturnValue({ addRace: mockAddRace });
    idCounter = 0;
    jest.clearAllMocks();
  });

  describe("First Step - Basic Information", () => {
    it("renders with next button disabled initially", () => {
      render(<CreateRacePage />);

      const nextButton = screen.getByRole("button", { name: /next/i });
      expect(nextButton).toBeDisabled();
    });

    it("next button is only enabled when total participants is 2 or more", async () => {
      render(<CreateRacePage />);

      const totalParticipantsInput = screen.getByPlaceholderText(
        /Enter total participants/i
      );
      const nextButton = screen.getByRole("button", { name: /next/i });

      // Initially disabled
      expect(nextButton).toBeDisabled();

      // Still disabled with 1 participant
      await user.type(totalParticipantsInput, "{1}");
      expect(nextButton).toBeDisabled();

      // Enabled with 2 participants
      await user.clear(totalParticipantsInput);
      await user.type(totalParticipantsInput, "{2}");
      expect(nextButton).not.toBeDisabled();
    });

    it("proceeds to second step with valid inputs", async () => {
      render(<CreateRacePage />);

      // Fill in valid data
      await user.type(screen.getByLabelText(/Title/i), "Valid Title");
      await user.type(screen.getByLabelText(/Total Participants/i), "2");

      const nextButton = screen.getByRole("button", { name: /Next/i });
      expect(nextButton).not.toBeDisabled();
      await user.click(nextButton);

      // Should proceed to second step
      expect(
        screen.getByPlaceholderText(/Enter participant name and press enter/i)
      ).toBeInTheDocument();
    });
  });

  describe("Form Validation - Second Step", () => {
    const setupSecondStep = async () => {
      render(<CreateRacePage />);

      // Fill in valid first step data
      await user.type(screen.getByLabelText(/title/i), "Valid Title");
      await user.type(screen.getByLabelText(/total participants/i), "2");
      await user.click(screen.getByRole("button", { name: /next/i }));

      // Wait for second step to render
      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter participant name/i)
        ).toBeInTheDocument();
      });
    };

    it("add participant when name is inputted and the enter key is pressed", async () => {
      await setupSecondStep();

      const participantInput = screen.getByPlaceholderText(
        /enter participant name/i
      );
      await user.type(participantInput, "racer 1");
      await user.keyboard("{Enter}");

      expect(await screen.findByText("Racer 1: racer 1")).toBeInTheDocument();
    });

    it("prevents form submission when participants count doesn't match totalParticipants", async () => {
      await setupSecondStep();

      // Add only one participant when we specified two
      const participantInput = screen.getByPlaceholderText(
        /enter participant name/i
      );
      await user.type(participantInput, "John Doe");
      await user.keyboard("{Enter}");

      const submitButton = screen.getByRole("button", { name: /add race/i });
      await user.click(submitButton);

      expect(
        await screen.findByText("race requires at least 2 participants.")
      ).toBeInTheDocument();
      expect(mockAddRace).not.toHaveBeenCalled();
    });

    it("allows form submission with valid participant data", async () => {
      await setupSecondStep();

      // Add two participants as required
      const participantInput = screen.getByPlaceholderText(
        /enter participant name/i
      );
      await user.type(participantInput, "John Doe");
      await user.keyboard("{Enter}");
      await user.type(participantInput, "Jane Doe");
      await user.keyboard("{Enter}");

      // Submit the form
      const submitButton = screen.getByRole("button", { name: /add race/i });
      await user.click(submitButton);

      // Verify the race was added with correct data
      expect(mockAddRace).toHaveBeenCalledWith({
        id: expect.any(String),
        title: "Valid Title",
        totalParticipants: 2,
        participants: [
          { id: "p1", name: "John Doe", lane: 1 },
          { id: "p2", name: "Jane Doe", lane: 2 },
        ],
      });

      expect(mockRouter.push).toHaveBeenCalled();
    });

    it("maintains lane assignments when removing and adding participants", async () => {
      await setupSecondStep();

      // Add participants
      const participantInput = screen.getByPlaceholderText(
        /enter participant name/i
      );
      await user.type(participantInput, "John Doe");
      await user.keyboard("{Enter}");
      await user.type(participantInput, "Jane Doe");
      await user.keyboard("{Enter}");

      // Remove first participant
      const removeButtons = screen.getAllByRole("button", { name: /remove/i });
      await user.click(removeButtons[0]);

      // Add new participant
      await user.type(participantInput, "Bob Smith");
      await user.keyboard("{Enter}");

      // Verify lane assignments
      const participants = screen.getAllByText(/lane/i);
      expect(participants[0]).toHaveTextContent("Lane 2"); // Jane Doe
      expect(participants[1]).toHaveTextContent("Lane 1"); // Bob Smith
    });

    it("preserves form data when going back to first step", async () => {
      await setupSecondStep();

      // Add a participant
      const participantInput = screen.getByPlaceholderText(
        /enter participant name/i
      );
      await user.type(participantInput, "John Doe");
      await user.keyboard("{Enter}");

      // Go back to first step
      const backButton = screen.getByRole("button", { name: /back/i });
      await user.click(backButton);

      // Verify data is preserved
      expect(screen.getByLabelText(/title/i)).toHaveValue("Valid Title");
      expect(screen.getByLabelText(/total participants/i)).toHaveValue(2);

      // Go forward again
      await user.click(screen.getByRole("button", { name: /next/i }));

      // Verify participant data is preserved
      expect(await screen.findByText(/John Doe/)).toBeInTheDocument();
    });
  });
});
