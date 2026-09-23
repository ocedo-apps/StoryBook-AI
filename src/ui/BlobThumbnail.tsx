import { useEffect, useState } from "react";

export function BlobThumbnail({
  blob,
  alt,
  variant
}: {
  blob: Blob;
  alt: string;
  variant: "cover" | "large" | "settings";
}) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);
  const className =
    variant === "cover"
      ? "illustration-style-card-image"
      : variant === "large"
        ? "illustration-style-thumb-large"
        : "illustration-style-settings-thumb";
  if (!url) return <span className={`${className} illustration-style-placeholder`} aria-hidden="true" />;
  return <img src={url} alt={alt} className={className} />;
}
