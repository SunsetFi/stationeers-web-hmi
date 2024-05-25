import React from "react";
import styled from "@emotion/styled";
import { Navigate, useParams } from "react-router";

import { useDIDependency } from "@/container";

import { HmiContext } from "@/services/hmi/HmiContext";

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
    overflow: "hidden",
  },
});

const DisplayFrame: React.FC<DisplayFrameProps> = ({ children }) => {
  const { displayReferenceId } = useParams();

  const hmiContext = useDIDependency(HmiContext);

  const [x, setX] = React.useState(Number.NaN);
  const [y, setY] = React.useState(Number.NaN);

  React.useEffect(() => {
    hmiContext.setDisplayReferenceId(displayReferenceId ?? null);
    return () => {
      hmiContext.setDisplayReferenceId(null);
    };
  }, []);

  const onMouseMove = React.useCallback((event: React.MouseEvent) => {
    setX(event.clientX);
    setY(event.clientY);
  }, []);

  const onMouseOut = React.useCallback(() => {
    setX(Number.NaN);
    setY(Number.NaN);
  }, []);

  return (
    <DisplayFrameStyle>
      {!displayReferenceId && <Navigate to="/" />}
      {!Number.isNaN(x) && !Number.isNaN(y) && (
        <div
          style={{
            position: "absolute",
            left: x - 5,
            top: y - 5,
            backgroundColor: "white",
            borderRadius: 5,
            width: 10,
            height: 10,
            zIndex: 1000,
            pointerEvents: "none",
          }}
        />
      )}
      <div
        className="display-frame-content"
        onMouseOut={onMouseOut}
        onMouseMove={onMouseMove}
      >
        {children}
      </div>
    </DisplayFrameStyle>
  );
};

export default DisplayFrame;
