export interface UserProfile {
  id: string | number;
  userName: string;
  email: string;
  roles?: string[];
}

export const getUserProfile = async (): Promise<UserProfile | null> => {
  return null;
};
