import * as usersRepo from "../repositories/users.repository";

export const usersService = {
  async getAll(filters: { role?: string }) {
    const items = await usersRepo.findAll(filters.role);
    return {
      data: items,
      meta: { count: items.length },
    };
  },
  async getById(id: string) {
    return usersRepo.findById(id);
  },
  async create(dto: any) {
    return usersRepo.create(dto);
  },
  async update(id: string, dto: any) {
    return usersRepo.update(id, dto);
  },
  async delete(id: string) {
    return usersRepo.remove(id);
  },
};
