import { useState } from "react";
import "./CollapsibleSection.css";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleSection({ 
  title, 
  children, 
  defaultOpen = true 
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="collapsible-section">
      <div 
        className="collapsible-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="collapsible-title">{title}</span>
        <button 
          className="collapsible-toggle"
          type="button"
          aria-label={isOpen ? "Collapse section" : "Expand section"}
        >
          <svg 
            className={`chevron ${isOpen ? "open" : ""}`}
            width="12" 
            height="12" 
            viewBox="0 0 12 12"
          >
            <path 
              d="M2 4 L6 8 L10 4" 
              stroke="currentColor" 
              strokeWidth="2" 
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div className={`collapsible-content ${isOpen ? "open" : ""}`}>
        <div className="collapsible-content-inner">
          {children}
        </div>
      </div>
    </div>
  );
}