"use client";
import { useParams, useRouter } from "next/navigation";
import { useRaceStore } from "@/app/store/raceStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateRaceSchema } from "@/schemas/race";
import { Race } from "@/typings/race";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addOrdinalSuffix } from "@/app/utils/helper";
import { Form } from "@/components/ui/form";

const RaceResultsPage = () => {
  const { races, updateRace } = useRaceStore();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const race = races.find((race) => race.id === id);

  if (!race) return router.push("/races/create");

  const form = useForm<Race>({
    resolver: zodResolver(CreateRaceSchema),
    defaultValues: {
      ...race,
      participants: race.participants
        .sort((a, b) => a.lane - b.lane)
        .map((p, index) => ({
          ...p,
          place: index + 1,
        })),
    },
  });

  const participants = form.watch("participants");

  const swapPlaces = (newPlace: string, participantId: string) => {
    form.setValue(
      "participants",
      participants.map((p) => {
        if (p.id === participantId) {
          return { ...p, place: parseInt(newPlace, 10) };
        }
        if (p.place === parseInt(newPlace, 10)) {
          const selectedParticipant = participants.find(
            (part) => part.id === participantId
          );
          return { ...p, place: selectedParticipant.place };
        }
        return p;
      })
    );
  };

  const handleAddRace = (race: Race) => {
    updateRace(race.id, race);
    router.push(`/`);
  };

  return (
    <div className="flex">
      <div className="w-[90%] md:w-3/4 mx-auto space-y-6">
        <h1 className="text-2xl md:text-4xl font-bold capitalize border-b pb-4">
          Enter Final Results
        </h1>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleAddRace)}
            className="space-y-4"
          >
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex justify-between items-center gap-4 rounded-xl border p-4"
              >
                <span className="capitalize flex-1">
                  Racer {participant.lane}: {participant.name}
                </span>
                <Select
                  value={participant.place ? participant.place.toString() : ""}
                  onValueChange={(newLane) =>
                    swapPlaces(newLane, participant.id)
                  }
                >
                  <SelectTrigger className="w-[90px] md:w-[180px]">
                    <SelectValue placeholder="Select a place" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      { length: participants.length },
                      (_, i) => i + 1
                    ).map((position) => (
                      <SelectItem value={position.toString()} key={position}>
                        {addOrdinalSuffix(position)} Place
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </form>
        </Form>
        <button onClick={handleSaveResults}>Save Results</button>
      </div>
    </div>
  );
};

export default RaceResultsPage;
