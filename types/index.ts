export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  color: string;
  isAvailable: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
}

export interface Recommendation {
  id: string;
  vehicleId: string;
  userId: string;
  score: number;
  createdAt: Date;
}

export interface DashboardStats {
  totalVehicles: number;
  totalUsers: number;
  totalRecommendations: number;
}