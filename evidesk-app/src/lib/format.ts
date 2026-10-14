export function formatUnixTimestamp(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const numericValue =
    typeof value === "number" ? value : Number.parseInt(String(value), 10);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return String(value);
  }

  const date = new Date(numericValue * 1000);

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatFileSize(bytes: number | null | undefined) {
  if (bytes === null || bytes === undefined || !Number.isFinite(bytes) || bytes < 0) {
    return "—";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 100 ? 0 : 1)} ${units[unitIndex]}`;
}