import React from 'react';

export default function InsightCard({ title, value, rating, loading }) {
  const isLoading = value === "0%";
  return (
    <div className="bg-white shadow-md rounded-lg p-4 text-center">
      {isLoading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-6 bg-gray-300 rounded w-1/2 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
        </div>
      ) : (
        <>
          <p className="text-3xl font-bold text-indigo-600">{value}</p>
          <h4 className="text-lg font-semibold mt-2">{title}</h4>
          <p className="text-sm text-gray-500">{rating}</p>
        </>
      )}
    </div>
  );
}