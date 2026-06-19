export type Role = "customer" | "seller" | "admin";
export type UserStatus = "active" | "banned";
export type OrderStatus =
  | "placed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export const Role = {
  customer: "customer" as Role,
  seller: "seller" as Role,
  admin: "admin" as Role,
};

export const UserStatus = {
  active: "active" as UserStatus,
  banned: "banned" as UserStatus,
};

export const OrderStatus = {
  placed: "placed" as OrderStatus,
  processing: "processing" as OrderStatus,
  shipped: "shipped" as OrderStatus,
  delivered: "delivered" as OrderStatus,
  cancelled: "cancelled" as OrderStatus,
};
