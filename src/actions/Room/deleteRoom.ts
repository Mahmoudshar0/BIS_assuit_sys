import { toast } from "sonner";
import { apiUrl } from "./types";

export const deleteRoom = async (id: number) => {
  try {
    const res = await fetch(`${apiUrl}/Room/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete room");

    toast.success("تم حذف القاعة بنجاح.");
    return true;
  } catch (err) {
    console.error("❌ Error deleting room:", err);
    toast.error("فشل الحذف.");
    return false;
  }
};
