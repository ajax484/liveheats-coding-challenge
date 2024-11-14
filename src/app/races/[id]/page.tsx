"use client";
import { useRaceStore } from "@/app/store/raceStore";
import { useRouter } from "next/navigation";

const RaceDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { races } = useRaceStore();

  const race = races.find((race) => race.id === id);

  return (
    <div>
      <h1>Results for {race?.name}</h1>
      {race?.results
        .sort((a, b) => a.place - b.place)
        .map((result) => (
          <div key={result.studentId}>
            {result.place}:{" "}
            {
              race?.participants.find((p) => p.student.id === result.studentId)
                ?.student.name
            }
          </div>
        ))}
    </div>
  );
};

export default RaceDetailPage;
