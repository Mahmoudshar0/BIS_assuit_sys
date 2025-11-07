export interface Role {
  id: number;
  name: string;
  description: string;
}

export type RolePayload = Omit<Role, "id"> & {
  id?: number;
};

export const apiUrl = process.env.NEXT_PUBLIC_API_URL;
