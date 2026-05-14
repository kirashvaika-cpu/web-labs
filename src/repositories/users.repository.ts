import { v4 as uuidv4 } from "uuid";
import { UserEntity } from "../models";

const store = new Map<string, UserEntity>();

export const usersRepository = {
  getAll(): UserEntity[] {
    return Array.from(store.values());
  },

  getById(id: string): UserEntity | undefined {
    return store.get(id);
  },

  add(data: Omit<UserEntity, "id" | "createdAt">): UserEntity {
    const entity: UserEntity = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      ...data,
    };
    store.set(entity.id, entity);
    return entity;
  },

  update(id: string, data: Partial<Omit<UserEntity, "id" | "createdAt">>): UserEntity | undefined {
    const existing = store.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    store.set(id, updated);
    return updated;
  },

  delete(id: string): boolean {
    return store.delete(id);
  },
};
