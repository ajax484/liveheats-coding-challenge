"use client";
import React from "react";
import { useRaceStore } from "@/app/store/raceStore";
import { useParams } from "next/navigation";
import { addOrdinalSuffix } from "@/app/utils/helper";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const RaceDetailsPage = () => {
  const { id } = useParams();
  const { races } = useRaceStore();
  const race = races.find((r) => r.id === id);

  if (!race) return <p>Race not found</p>;

  const sortedParticipants = React.useMemo(
    () => race.participants.sort((a, b) => a.place - b.place),
    [race.participants]
  );

  return (
    <div className="space-y-8">
      {/* Race Details */}
      <section className="px-8 py-4">
        <h2 className="text-3xl font-semibold">{race.title}</h2>
      </section>

      {/* Participants Results Table */}
      <section className="px-8 py-6">
        <h3 className="text-2xl font-bold mb-4">Race Results</h3>
        <table className="w-full bg-white shadow-md rounded overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-3 px-6 text-left">Position</th>
              <th className="py-3 px-6 text-left">Participant Name</th>
            </tr>
          </thead>
          <tbody>
            {sortedParticipants.map((participant, index) => (
              <tr
                key={participant.id}
                className={`${
                  index < 3 ? "bg-yellow-100" : "bg-white"
                } hover:bg-gray-100 transition-colors`}
              >
                <td className="py-4 px-6">
                  {participant.place === 1
                    ? "🥇 1st"
                    : participant.place === 2
                    ? "🥈 2nd"
                    : participant.place === 3
                    ? "🥉 3rd"
                    : addOrdinalSuffix(participant.place)}
                </td>
                <td className="py-4 px-6 capitalize">{participant.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Back Button */}
      <section className="px-8 py-4">
        <Link href={"/"}>
          <Button className="btn" type="submit">
            Back to Races
          </Button>
        </Link>
      </section>
    </div>
  );
};

export default RaceDetailsPage;
