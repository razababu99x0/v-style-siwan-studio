import {
  boolean,
  integer,
  jsonb,
  pgTable,
  real,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { ColorOption } from "@/lib/catalog";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  subtitle: text("subtitle").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  mrp: integer("mrp").notNull(),
  images: jsonb("images").$type<string[]>().notNull(),
  colors: jsonb("colors").$type<ColorOption[]>().notNull(),
  sizes: jsonb("sizes").$type<string[]>().notNull(),
  rating: real("rating").notNull().default(4.5),
  reviews: integer("reviews").notNull().default(0),
  stock: integer("stock").notNull().default(10),
  badge: text("badge"),
  featured: boolean("featured").notNull().default(false),
  accent: text("accent").notNull().default("pink"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  quote: text("quote").notNull(),
  purchase: text("purchase").notNull(),
  rating: integer("rating").notNull().default(5),
  accent: text("accent").notNull().default("pink"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type OrderItem = {
  slug: string;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
  qty: number;
};

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderCode: text("order_code").notNull().unique(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  addressLine: text("address_line"),
  landmark: text("landmark"),
  city: text("city").notNull().default("Siwan"),
  pincode: text("pincode"),
  fulfilment: text("fulfilment").notNull().default("pickup"),
  paymentMethod: text("payment_method").notNull().default("whatsapp"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  items: jsonb("items").$type<OrderItem[]>().notNull(),
  subtotal: integer("subtotal").notNull(),
  discount: integer("discount").notNull().default(0),
  gst: integer("gst").notNull().default(0),
  shipping: integer("shipping").notNull().default(0),
  total: integer("total").notNull(),
  couponCode: text("coupon_code"),
  notes: text("notes"),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ProductRow = typeof products.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
