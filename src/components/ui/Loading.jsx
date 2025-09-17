import React from "react";

export default function Loading() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100px"
    }}>
      <div className="spinner" />
      <style>{`
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #ccc;
          border-top: 4px solid #ff6f61;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}