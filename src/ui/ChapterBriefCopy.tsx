import React, { useEffect, useRef } from "react";

export function ChapterBriefCopy({
  id,
  value,
  placeholder,
  label,
  className,
  onCommit
}: {
  id: string;
  value: string;
  placeholder: string;
  label: string;
  className?: string;
  onCommit: (next: string) => void;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || document.activeElement === node) return;
    if ((node.innerText ?? "") !== value) node.innerText = value;
  }, [value]);
  return (
    <p
      ref={ref}
      id={id}
      className={className ? `chapter-brief-text ${className}` : "chapter-brief-text"}
      contentEditable="plaintext-only"
      role="textbox"
      aria-multiline="true"
      aria-label={label}
      data-placeholder={placeholder}
      onBlur={() => {
        const next = ref.current?.innerText ?? "";
        if (next !== value) onCommit(next);
      }}
    />
  );
}
