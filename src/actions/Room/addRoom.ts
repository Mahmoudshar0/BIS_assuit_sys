import { toast } from "sonner";
import { RoomPayload, apiUrl } from "./types";

export const addRoom = async (payload: RoomPayload) => {
  try {
    const res = await fetch(`${apiUrl}/Room`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to add room");

    toast.success("تم إضافة القاعة بنجاح.");
    return true;
  } catch (err) {
    console.error("❌ Error adding room:", err);
    toast.error("فشل الإضافة.");
    return false;
  }
};
