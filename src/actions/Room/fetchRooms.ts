import { toast } from "sonner";
import { Room, apiUrl } from "./types";

export const fetchRooms = async (): Promise<Room[]> => {
  try {
    const res = await fetch(`${apiUrl}/Room`);
    if (!res.ok) throw new Error("Failed to fetch rooms");

    return await res.json();
  } catch (err) {
    console.error("❌ Error fetching rooms:", err);
    toast.error("فشل في جلب بيانات القاعات.");
    return [];
  }
};
