import { toast } from "sonner";
import { RoomPayload, apiUrl } from "./types";

export const updateRoom = async (payload: RoomPayload) => {
  try {
    const res = await fetch(`${apiUrl}/Room/${payload.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to update room");

    toast.success("تم تحديث القاعة بنجاح.");
    return true;
  } catch (err) {
    console.error("❌ Error updating room:", err);
    toast.error("فشل التحديث.");
    return false;
  }
};
