"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface LeverSwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

export const LeverSwitch = ({
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  className,
  id,
  name,
}: LeverSwitchProps) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isChecked = controlledChecked !== undefined ? controlledChecked : internalChecked;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const newChecked = e.target.checked;
    if (controlledChecked === undefined) {
      setInternalChecked(newChecked);
    }
    onCheckedChange?.(newChecked);
  };

  return (
    <div className={cn("toggle-container", disabled && "opacity-50 pointer-events-none", className)}>
      <input
        id={id}
        name={name}
        className="toggle-input"
        type="checkbox"
        checked={isChecked}
        onChange={handleChange}
        disabled={disabled}
      />
      <div className="toggle-handle-wrapper">
        <div className="toggle-handle">
          <div className="toggle-handle-knob" />
          <div className="toggle-handle-bar-wrapper">
            <div className="toggle-handle-bar" />
          </div>
        </div>
      </div>
      <div className="toggle-base">
        <div className="toggle-base-inside" />
      </div>
    </div>
  );
};

// Also export as Component for compatibility
export const Component = LeverSwitch;
