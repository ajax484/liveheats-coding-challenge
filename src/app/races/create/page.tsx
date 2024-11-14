"use client";
import { useRaceStore } from "@/app/store/raceStore";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateRaceSchema } from "@/schemas/race";
import { Race } from "@/typings/race";
import { generateId } from "@/app/utils/helper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useRouter } from "next/navigation";

const CreateRacePage = () => {
  const form = useForm<Race>({
    resolver: zodResolver(CreateRaceSchema),
    defaultValues: {
      title: "",
      participants: [],
      totalParticipants: 2,
    },
  });

  const { addRace } = useRaceStore();
  const [newParticipant, setNewParticipant] = useState("");
  const [isFirstStepComplete, setIsFirstStepComplete] = useState(false);
  const router = useRouter();
  const totalParticipants = form.watch("totalParticipants");
  const participants = form.watch("participants");

  const handleAddRace = (race: Race) => {
    const id = generateId();
    addRace({ ...race, id });
    router.push(`/races/${id}/result`);
  };

  const getNextLane = () => {
    const assignedLanes = participants.map((p) => p.lane);
    for (let i = 1; i <= totalParticipants; i++) {
      if (!assignedLanes.includes(i)) return i;
    }
    return participants.length + 1;
  };

  const removeParticipant = (id: string) => {
    form.setValue(
      "participants",
      participants.filter((p) => p.id !== id)
    );
  };

  const handleAddParticipant = () => {
    if (newParticipant.trim()) {
      form.setValue("participants", [
        ...participants,
        {
          name: newParticipant,
          lane: getNextLane(),
          id: generateId(),
        },
      ]);
      setNewParticipant("");
    }
  };

  const swapLane = (newLane: string, participantId: string) => {
    form.setValue(
      "participants",
      participants.map((p) => {
        if (p.id === participantId) {
          return { ...p, lane: parseInt(newLane, 10) };
        }
        if (p.lane === parseInt(newLane, 10)) {
          const selectedParticipant = participants.find(
            (part) => part.id === participantId
          );
          return { ...p, lane: selectedParticipant.lane };
        }
        return p;
      })
    );
  };

  const handleFirstStepSubmit = () => {
    if (form.getValues("title") && totalParticipants > 0) {
      setIsFirstStepComplete(true);
    }
  };

  const handleBackToFirstStep = () => {
    setIsFirstStepComplete(false);
  };

  return (
    <div className="flex">
      <div className="w-[90%] md:w-3/4 mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold capitalize border-b pb-4">
          Create a new race
        </h1>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleAddRace)}
            className="space-y-6 mt-4"
          >
            {/* First Part - Race Title and Total Participants */}
            <div className="flex gap-4 flex-col md:flex-row">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Liveheats regional"
                        className="w-full"
                        {...field}
                        disabled={isFirstStepComplete}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalParticipants"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Total Participants</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter total participants"
                        type="number"
                        {...field}
                        onChange={(e) => {
                          form.setValue("participants", []);
                          form.setValue(
                            "totalParticipants",
                            parseInt(e.currentTarget.value)
                          );
                        }}
                        disabled={isFirstStepComplete}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {!isFirstStepComplete && (
              <Button
                className="btn"
                type="button"
                onClick={handleFirstStepSubmit}
                disabled={totalParticipants < 2}
              >
                Next
              </Button>
            )}

            {/* Second Part - Add Participants and Set Lanes */}
            {isFirstStepComplete && (
              <>
                <FormField
                  control={form.control}
                  name="participants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Participant</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter participant name and press enter"
                          value={newParticipant}
                          onChange={(e) => setNewParticipant(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddParticipant();
                            }
                          }}
                          disabled={participants.length === totalParticipants}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {participants.map((participant, index) => (
                  <div
                    key={participant.id}
                    className="flex justify-between items-center gap-4 rounded-xl border p-4"
                  >
                    <span className="capitalize flex-1">
                      Racer {index + 1}: {participant.name}
                    </span>
                    <Select
                      value={participant.lane.toString()}
                      onValueChange={(newLane) =>
                        swapLane(newLane, participant.id)
                      }
                    >
                      <SelectTrigger className="w-[90px] md:w-[180px]">
                        <SelectValue placeholder="Select a lane" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          { length: totalParticipants },
                          (_, i) => i + 1
                        ).map((lane) => (
                          <SelectItem value={lane.toString()} key={lane}>
                            Lane {lane}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="destructive"
                      onClick={() => removeParticipant(participant.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}

                <div className="flex gap-4">
                  <Button className="btn" onClick={handleBackToFirstStep}>
                    Back
                  </Button>
                  <Button className="btn" type="submit">
                    Add Race
                  </Button>
                </div>
              </>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateRacePage;
