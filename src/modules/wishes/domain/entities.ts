export type WishCategory = 'ASSINATURAS' | 'ELETRONICOS' | 'JOGOS' | 'LAZER';

export interface WishItem {
  id: string;
  userId: string;
  name: string;
  price: number;
  link: string | null;
  description: string | null;
  category: WishCategory;
  createdAt: Date;
  updatedAt: Date;
}

export interface SerializedWishItem {
  id: string;
  name: string;
  price: number;
  link: string | null;
  description: string | null;
  category: WishCategory;
  createdAt: string;
  updatedAt: string;
}
