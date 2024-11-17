"use client";
import React from "react";
import { useRaceStore } from "@/app/store/raceStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const LandingPage = () => {
  const { races } = useRaceStore();

  return (
    <div>
      {/* Hero */}
      <section className="bg-hero-pattern bg-cover py-4 flex flex-col justify-center items-center text-white text-center px-4">
        <Input
          type="text"
          placeholder="Search races..."
          className="mt-4 px-4 py-2 rounded w-1/2 max-w-md"
        />
      </section>

      {/* Races List */}
      <section className="px-8 py-6">
        <h3 className="text-3xl font-bold mb-4">All Races</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {races.map((race) => (
            <div
              key={race.id}
              className="bg-white shadow-md p-4 rounded space-y-2 border"
            >
              <h4 className="text-xl font-bold">{race.title}</h4>

              {/* Top 3 Participants */}
              <div className="mt-4 space-y-2">
                {race.participants
                  .sort((a, b) => a.place - b.place)
                  .slice(0, 3)
                  .map((participant, index) => (
                    <div
                      key={participant.id}
                      className="flex items-center space-x-2"
                    >
                      <span
                        className={`font-semibold text-lg ${
                          index === 0
                            ? "text-gold"
                            : index === 1
                            ? "text-silver"
                            : "text-bronze"
                        }`}
                      >
                        {index + 1}{" "}
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                      </span>
                      <span>{participant.name}</span>
                    </div>
                  ))}
              </div>

              <Link href={`/races/${race.id}`}>
                <Button className="btn" type="submit">
                  View Full Results
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
