const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function deleteSemester(id: number): Promise<string> {
  const res = await fetch(`${apiUrl}/Semester/${id}`, {
    method: "DELETE",
  });

  const result = await res.text();
  if (!res.ok) throw new Error(result || "Failed to delete semester");

  return result;
}
