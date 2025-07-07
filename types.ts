
export enum Role {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

export interface User {
  id: number;
  username: string;
  role: Role;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId: number;
  items: CartItem[];
  total: number;
  orderDate: Date;
}
