import React from "react";
import { useNavigate, useHref } from "react-router";

import { Button, ButtonProps } from "@mui/material";

export interface ButtonLinkProps {
  className?: string;
  size?: ButtonProps["size"];
  title?: string;
  color?: ButtonProps["color"];
  to: string;
  disabled?: boolean;
  children: React.ReactNode;
}

const ButtonLink = ({
  className,
  size,
  title,
  color,
  to,
  disabled,
  children,
}: ButtonLinkProps) => {
  const href = useHref(to);
  const navigate = useNavigate();
  const onClick = React.useCallback(
    (e: React.MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) {
        return;
      }

      if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) {
        return;
      }

      e.preventDefault();
      navigate(to);
    },
    [to, navigate]
  );
  return (
    <Button
      className={className}
      size={size}
      title={title}
      color={color}
      component="a"
      href={href}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};
export default ButtonLink;
