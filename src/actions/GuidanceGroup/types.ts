export interface GuidanceGroup {
  id: number;
  groupName: string;
  enLevel: number;
}

export type GuidanceGroupPayload = Omit<GuidanceGroup, "id"> & {
  id?: number;
};

export const apiUrl = process.env.NEXT_PUBLIC_API_URL;
