import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
export const users = pgTable("users", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    name: text("name").notNull(),
    plan: text("plan").notNull().default("free"), // free, standard, pro
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export const trips = pgTable("trips", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    driverName: text("driver_name").notNull(),
    phone: text("phone").notNull(),
    plate: text("plate").notNull(),
    origin: text("origin").notNull(),
    destination: text("destination").notNull(),
    status: text("status").notNull().default("pending"), // pending, active, completed, cancelled
    lastLocation: text("last_location"),
    observations: text("observations"),
    progress: integer("progress").default(0),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export const usersRelations = relations(users, ({ many }) => ({
    trips: many(trips),
}));
export const tripsRelations = relations(trips, ({ one }) => ({
    user: one(users, {
        fields: [trips.userId],
        references: [users.id],
    }),
}));
// Schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const selectUserSchema = createSelectSchema(users);
export const insertTripSchema = createInsertSchema(trips).omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
});
export const selectTripSchema = createSelectSchema(trips);
export const loginSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});
export const registerSchema = insertUserSchema.extend({
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
});
//# sourceMappingURL=schema.js.map