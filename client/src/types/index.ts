export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'standard' | 'pro';
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  userId: string;
  driverName: string;
  phone: string;
  plate: string;
  origin: string;
  destination: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  lastLocation?: string;
  observations?: string;
  progress: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TripStats {
  total: number;
  active: number;
  completed: number;
  drivers: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}
