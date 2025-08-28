import React from "react";

export default function Snackbar({ open, message, onClose }) {
  if (!open) return null;
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      position: "fixed",
      bottom: 20,
      left: "50%",
      transform: "translateX(-50%)",
      background: "#ff1414ff",
      color: "#fff",
      borderRadius: 8,
      zIndex: 9999,
      width: "75vw", //TODO => Tornar isso responsivo para diferentes resoluções
      border: "1px solid #000"    

    }}>
      <div style={{margin: "12px 24px"}}>
        {message}
      </div>
      <div style={{display: "flex", flexDirection: "row-reverse", height: "50%", margin: "5px"}}>
        <button onClick={onClose} style={{  color: "#fff", backgroundColor: 'darkred', border: "none", borderRadius: 25 }}>X</button>
      </div>
      
      
    </div>
  );
}