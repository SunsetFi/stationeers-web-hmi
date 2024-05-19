import React from "react";
import styled from "@emotion/styled";

export interface DisplayFrameProps {
  children: React.ReactNode;
}

const DisplayFrameStyle = styled.div({
  width: "100%",
  height: "100%",
  display: "flex",
  padding: 16,
  position: "relative",
  [".display-frame-content"]: {
    boxSizing: "border-box",
    position: "relative",
    border: "2px solid white",
    padding: 12,
    borderRadius: 28,
    width: "100%",
    height: "100%",
    fontSize: 64,
  },
});

const DisplayFrame: React.FC<DisplayFrameProps> = ({ children }) => {
  const [x, setX] = React.useState(0);
  const [y, setY] = React.useState(0);
  return (
    <DisplayFrameStyle>
      <div
        style={{
          position: "absolute",
          left: x - 5,
          top: y - 5,
          backgroundColor: "white",
          borderRadius: 5,
          width: 10,
          height: 10,
        }}
      />
      <div
        className="display-frame-content"
        onMouseMove={(e) => {
          setX(e.clientX);
          setY(e.clientY);
        }}
      >
        {children}
      </div>
    </DisplayFrameStyle>
  );
};

export default DisplayFrame;
