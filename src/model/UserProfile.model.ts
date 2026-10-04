interface UserProfile {
  id?: number;
  name: string;
  phone: string;
  email: string;
  status?: string;
  address: string;
  taxNumber?: string;
  ibanNumber?: string;
  registrationNumber?: string;
  coverImage?: string;
  profilePhoto?: string;
}

export default UserProfile;
