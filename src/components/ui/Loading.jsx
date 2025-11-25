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
              width: 80px;
              height: 80px;
              border: 10px solid #ccc;
              border-top: 10px solid #1A78C2;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              }
              @keyframes spin {
              to { transform: rotate(360deg); }
              }
            `}
      </style>
    </div>
  );
}