"use client";
import { useParams, useRouter } from "next/navigation";
import { useRaceStore } from "@/app/store/raceStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateRaceSchema } from "@/schemas/race";
import { Participants, Race } from "@/typings/race";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addOrdinalSuffix } from "@/app/utils/helper";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Link } from "lucide-react";

const RaceResultsPage = () => {
  const { races, updateRace } = useRaceStore();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const race = races.find((race) => race.id === id);

  const form = useForm<Race>({
    resolver: zodResolver(CreateRaceSchema),
    defaultValues: {
      ...race,
      participants:
        race &&
        race.participants
          .sort((a, b) => a.lane - b.lane)
          .map((p, index) => ({
            ...p,
            place: index + 1,
          })),
    },
  });

  const participants = form.watch("participants");

  const adjustPositions = (
    newPlace: number,
    participantId: string,
    oldPlace: number
  ) => {
    const newParticipants = participants.map((p) => {
      if (p.id === participantId) {
        return { ...p, place: newPlace };
      } else if (p.id !== participantId) {
        if (p.place < oldPlace && p.place > newPlace) {
          return { ...p, place: p.place + 1 };
        }

        if (p.place > oldPlace && p.place < newPlace) {
          return { ...p, place: p.place - 1 };
        }
      }

      // Leave unaffected participants as they are
      return p;
    });

    form.setValue("participants", newParticipants);
  };

  const validateRacePositions = (participants: Participants) => {
    // Sort participants by place to validate sequentially
    const sortedParticipants = participants.sort((a, b) => a.place - b.place);

    let expectedPlace = 1; // Start with the first place
    let i = 0;

    while (i < sortedParticipants.length) {
      const currentPlace = sortedParticipants[i].place;
      let tieCount = 1;

      // Check for ties by counting consecutive participants with the same place
      while (
        i + tieCount < sortedParticipants.length &&
        sortedParticipants[i + tieCount].place === currentPlace
      ) {
        tieCount++;
      }

      // Validate the current place: it must match the expected place
      if (currentPlace !== expectedPlace) {
        return false; // Invalid sequence found (gap in places)
      }

      // Skip the expected place by the number of tied participants
      expectedPlace += tieCount;
      i += tieCount; // Move to the next unique place in the list
    }

    return true; // All positions are valid
  };

  const handleUpdateRace = (race: Race) => {
    if (validateRacePositions(race.participants)) {
      updateRace(id, race);
      router.push(`/`);
    } else {
      alert("Invalid sequence of places detected. Please fix and try again.");
    }
  };

  if (!race)
    return (
      <div className="flex">
        <div className="w-[90%] md:w-3/4 mx-auto space-y-6">
          <h1 className="text-2xl md:text-4xl font-bold capitalize border-b pb-4">
            Update Final Results
          </h1>
          <p>Race not found</p>
          <Link href="/">
            <Button className="btn" type="submit">
              Back to Races
            </Button>
          </Link>
        </div>
      </div>
    );

  return (
    <div className="flex">
      <div className="w-[90%] md:w-3/4 mx-auto space-y-6">
        <h1 className="text-2xl md:text-4xl font-bold capitalize border-b pb-4">
          Update Final Results
        </h1>
        <Form {...form}>
          <form
            title="update race form"
            onSubmit={form.handleSubmit(handleUpdateRace)}
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
                  onValueChange={(newPlace) =>
                    adjustPositions(
                      parseInt(newPlace, 10),
                      participant.id,
                      participant.place
                    )
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
            <Button className="btn" type="submit">
              Update Result
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default RaceResultsPage;
