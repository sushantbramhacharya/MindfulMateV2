import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faRedo,
} from "@fortawesome/free-solid-svg-icons";
import HeaderComponent from "../components/HeaderComponent";

const inhaleDuration = 4000; // ms
const holdDuration = 2000;
const exhaleDuration = 4000;

const phases = [
  { name: "Inhale", duration: inhaleDuration },
  { name: "Hold", duration: holdDuration },
  { name: "Exhale", duration: exhaleDuration },
  { name: "Hold", duration: holdDuration },
];

const circleSizes = { min: 100, max: 200 };

export default function BreathingExercise() {
  const [instruction, setInstruction] = useState("Inhale");
  const [isPaused, setIsPaused] = useState(false);
  const [circleSize, setCircleSize] = useState(circleSizes.min);
  const phaseIndex = useRef(0);
  const startTime = useRef(null);
  const rafId = useRef(null);

  const colors = {
    Inhale: "#93c5fd", // blue-300
    Exhale: "#86efac", // green-300
    Hold: "#fdba74",   // orange-300
  };

  function animate(timestamp) {
    if (!startTime.current) startTime.current = timestamp;
    const elapsed = timestamp - startTime.current;

    if (isPaused) {
      rafId.current = requestAnimationFrame(animate);
      return;
    }

    let acc = 0;
    let currentPhase = null;
    let phaseElapsed = 0;

    for (let i = 0; i < phases.length; i++) {
      if (elapsed < acc + phases[i].duration) {
        currentPhase = phases[i];
        phaseElapsed = elapsed - acc;
        phaseIndex.current = i;
        break;
      }
      acc += phases[i].duration;
    }

    if (!currentPhase) {
      startTime.current = timestamp;
      setInstruction(phases[0].name);
      setCircleSize(circleSizes.min);
      rafId.current = requestAnimationFrame(animate);
      return;
    }

    if (instruction !== currentPhase.name) {
      setInstruction(currentPhase.name);
      if (navigator.vibrate) navigator.vibrate(50);
    }

    let size = circleSize;
    if (currentPhase.name === "Inhale") {
      size =
        circleSizes.min +
        ((circleSizes.max - circleSizes.min) * phaseElapsed) / currentPhase.duration;
    } else if (currentPhase.name === "Hold" && phaseIndex.current === 1) {
      size = circleSizes.max;
    } else if (currentPhase.name === "Exhale") {
      size =
        circleSizes.max -
        ((circleSizes.max - circleSizes.min) * phaseElapsed) / currentPhase.duration;
    } else if (currentPhase.name === "Hold" && phaseIndex.current === 3) {
      size = circleSizes.min;
    }

    setCircleSize(size);

    rafId.current = requestAnimationFrame(animate);
  }

  useEffect(() => {
    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, [isPaused]);

  const togglePause = () => {
    setIsPaused((p) => !p);
  };

  const reset = () => {
    cancelAnimationFrame(rafId.current);
    setInstruction("Inhale");
    setCircleSize(circleSizes.min);
    setIsPaused(false);
    startTime.current = null;
    rafId.current = requestAnimationFrame(animate);
  };

  return (
    <div className="min-h-screen bg-purple-50 flex flex-col">
      <HeaderComponent />
      <main className="flex-grow flex flex-col items-center justify-center p-6">
        <div
          style={{
            width: circleSize,
            height: circleSize,
            backgroundColor: colors[instruction] || colors.Hold,
            borderRadius: "50%",
            boxShadow: `0 0 ${circleSize / 2}px ${circleSize / 8}px ${
              colors[instruction] || colors.Hold
            }80`,
            transition: isPaused ? "none" : "background-color 0.5s ease",
          }}
        ></div>

        <h1 className="mt-10 text-4xl font-bold text-purple-900">{instruction}</h1>
        <p className="mt-2 text-gray-700">{isPaused ? "Paused" : "Follow the circle rhythm"}</p>

        <div className="mt-12 flex space-x-10">
          <button
            onClick={togglePause}
            aria-label={isPaused ? "Play breathing exercise" : "Pause breathing exercise"}
            className="text-purple-700 hover:text-purple-900 focus:outline-none text-4xl"
          >
            <FontAwesomeIcon icon={isPaused ? faPlay : faPause} />
          </button>
          <button
            onClick={reset}
            aria-label="Reset breathing exercise"
            className="text-purple-700 hover:text-purple-900 focus:outline-none text-4xl"
          >
            <FontAwesomeIcon icon={faRedo} />
          </button>
        </div>
      </main>
    </div>
  );
}
