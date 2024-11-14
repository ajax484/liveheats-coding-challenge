import { Race } from "@/typings/race";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type RaceState = {
  races: Race[];
  addRace: (race: Race) => void;
  updateRace: (raceId: string, values: Omit<Race, "id">) => void;
};

export const useRaceStore = create<RaceState>()(
  persist(
    (set) => ({
      races: [],
      addRace: (race) =>
        set((state) => ({
          races: [...state.races, race],
        })),
      updateRace: (raceId, values) =>
        set((state) => ({
          races: state.races.map((race) =>
            race.id === raceId ? { ...race, ...values } : race
          ),
        })),
    }),
    {
      name: "race",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
