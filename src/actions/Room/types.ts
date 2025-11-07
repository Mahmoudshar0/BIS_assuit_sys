export interface Room {
  id: number;
  name: string;
  capacity: number;
  location: string;
}

export type RoomPayload = Omit<Room, "id"> & {
  id?: number;
};

export const apiUrl = process.env.NEXT_PUBLIC_API_URL;
