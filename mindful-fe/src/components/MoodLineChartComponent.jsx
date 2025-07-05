import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const moods = [
  
  
  
  "Anxious",
  "Angry",
  "Sad",
  "Neutral",
  "Happy",
  "Excited",
  
];

// Map mood name to numeric Y-axis values
const moodToNum = moods.reduce((acc, mood, idx) => {
  acc[mood] = idx + 1;
  return acc;
}, {});

// Reverse map for Y-axis tick labels
const numToMood = Object.fromEntries(
  Object.entries(moodToNum).map(([k, v]) => [v, k])
);

const MoodLineChart = ({ moodHistory }) => {
  // Prepare data for the line chart
  const chartData = moodHistory.map((entry, index) => ({
    index: index + 1,
    moodNum: moodToNum[entry.mood] || 0,
    created_at: entry.created_at,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="index"
          label={{ value: "Logs", position: "insideBottom", offset: -5 }}
          tickCount={10}
          allowDecimals={false}
        />
        <YAxis
          type="number"
          domain={[1, moods.length]}
          ticks={Object.values(moodToNum)}
          tickFormatter={(num) => numToMood[num]}
          allowDecimals={false}
        />
        <Tooltip
          formatter={(value) => numToMood[value]}
          labelFormatter={(label) => `Log #${label}`}
        />
        <Line
          type="monotone"
          dataKey="moodNum"
          stroke="#7c3aed"
          strokeWidth={3}
          dot={{ r: 6 }}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MoodLineChart;
