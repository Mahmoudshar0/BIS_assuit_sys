import { apiUrl } from "./types";

export async function addStudentsUsingFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${apiUrl}/Students/upload`, {
    method: "POST",
    body: formData,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || "Failed to upload students file");
  return text;
}
