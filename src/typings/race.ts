import { CreateRaceSchema, ParticipantSchema } from "@/schemas/race";
import { z } from "zod";

export type Race = z.infer<typeof CreateRaceSchema> & {
  results: { studentId: string; place: number }[];
  id: string;
};

export type Participants = z.infer<typeof ParticipantSchema>[];
