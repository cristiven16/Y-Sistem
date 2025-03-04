// src/utils/Portal.tsx
import React from "react";
import ReactDOM from "react-dom";

interface PortalProps {
  children: React.ReactNode;
  containerId?: string; // default = "portal-root"
}

const Portal: React.FC<PortalProps> = ({
  children,
  containerId = "portal-root",
}) => {
  const container = document.getElementById(containerId);
  if (!container) return null;

  return ReactDOM.createPortal(children, container);
};

export default Portal;
