import { z } from "zod";

export const ParticipantSchema = z.object({
  name: z.string().min(2, {
    message: "participant name must be at least 2 characters.",
  }),
  lane: z.number({ required_error: "lane is required" }),
  id: z.string({ required_error: "id is required" }),
  place: z.number().int().min(1, "Position must be at least 1"),
});

export const CreateRaceSchema = z
  .object({
    title: z.string().min(2, {
      message: "title must be at least 2 characters.",
    }),
    participants: z.array(ParticipantSchema).min(2, {
      message: "race requires at least 2 participants.",
    }),
    totalParticipants: z.number().min(2, {
      message: "total participants must be greater than or equal to 2",
    }),
  })
  .refine((data) => data.participants.length === data.totalParticipants, {
    message: "Please assign all lanes to participants",
    path: ["participants"],
  });
