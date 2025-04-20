export type Role = 'homeowner' | 'professional' | 'vendor';

export interface User {
  email: string;
  password: string;
}

export interface Professional {
  id: string;
  fullName: string;
  professionType: string;
  experience: number;
  location: string;
  phone: string;
  bio: string;
  profilePicture?: string;
  createdAt: number;
}

export interface Vendor {
  id: string;
  companyName: string;
  businessType: string;
  yearsInBusiness: number;
  location: string;
  contactPerson: string;
  phone: string;
  description: string;
  logo?: string;
  createdAt: number;
}

export interface Homeowner {
  id: string;
  name: string;
  email: string;
  createdAt: number;
}

export type ProfessionType = 
  | 'Civil Engineer'
  | 'Architect'
  | 'Interior Designer'
  | 'Structural Engineer'
  | 'Project Manager'
  | 'Contractor'
  | 'Electrician'
  | 'Plumber'
  | 'Carpenter'
  | 'Mason'
  | 'Painter'
  | 'Landscaper'
  | 'HVAC Specialist'
  | 'Other';

export type BusinessType = 
  | 'Cement'
  | 'Steel'
  | 'Timber'
  | 'Glass'
  | 'Electrical'
  | 'Plumbing'
  | 'Hardware'
  | 'Tools'
  | 'Paint'
  | 'Flooring'
  | 'Roofing'
  | 'Insulation'
  | 'Solar'
  | 'Other';

export interface Product {
  id: string;
  vendor_id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  stock: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}
