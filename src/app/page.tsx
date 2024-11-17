"use client";

import React, { useState } from "react";
import { useRaceStore } from "@/app/store/raceStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const LandingPage = () => {
  const { races } = useRaceStore();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRaces = races.filter((race) =>
    race.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Hero Section */}
      <section className="flex gap-4 justify-center items-center">
        <Input
          type="text"
          placeholder="Search races..."
          className="px-4 py-2 rounded w-1/2 max-w-md"
          aria-label="Search races"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Link href="/races/create">
          <Button className="btn" type="button">
            Create A Race
          </Button>
        </Link>
      </section>

      {/* Races List */}
      <section className="px-8 py-6">
        <h3 className="text-3xl font-bold mb-4">All Races</h3>
        {filteredRaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRaces.map((race) => (
              <Link key={race.id} href={`/races/${race.id}`} passHref>
                <div
                  className="bg-white shadow-md p-4 rounded space-y-2 border h-full hover:shadow-lg transition-shadow cursor-pointer"
                  role="button"
                  aria-label={`View details for race ${race.title}`}
                >
                  <h4 className="text-xl font-bold capitalize">{race.title}</h4>

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
                            {participant.place}
                            {index === 0 ? " 🥇" : index === 1 ? " 🥈" : " 🥉"}
                          </span>
                          <span className="capitalize">{participant.name}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center w-full gap-2 h-[250px]"
            aria-live="polite"
          >
            <h1 className="text-2xl font-bold">No races found</h1>
            <p>You can create a race by clicking on the button below</p>
            <Link href="/races/create">
              <Button className="btn">Create A Race</Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default LandingPage;
