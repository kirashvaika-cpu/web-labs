import { usersRepository } from "../repositories/users.repository";
import { ApiError } from "../middleware/ApiError";
import { requireString, requireEmail, requireEnum, collectErrors } from "../middleware/validation";
import {
  CreateUserRequestDto,
  UpdateUserRequestDto,
  UserResponseDto,
  ListResponseDto,
} from "../dtos";
import { UserEntity } from "../models";

const ROLES = ["student", "admin"] as const;

function toDto(e: UserEntity): UserResponseDto {
  return { id: e.id, name: e.name, email: e.email, role: e.role, createdAt: e.createdAt };
}

export const usersService = {
  getAll(filters: { role?: string }): ListResponseDto<UserResponseDto> {
    let items = usersRepository.getAll();
    if (filters.role) {
      items = items.filter((u) => u.role === filters.role);
    }
    return { items: items.map(toDto), total: items.length };
  },

  getById(id: string): UserResponseDto {
    const user = usersRepository.getById(id);
    if (!user) throw ApiError.notFound("Користувача");
    return toDto(user);
  },

  create(dto: CreateUserRequestDto): UserResponseDto {
    const errors = collectErrors([
      requireString(dto.name, "name", 2, 100),
      requireEmail(dto.email, "email"),
      requireEnum(dto.role, "role", [...ROLES]),
    ]);
    if (errors.length > 0) throw ApiError.validationError(errors);

    const entity = usersRepository.add({
      name: dto.name.trim(),
      email: dto.email.trim().toLowerCase(),
      role: dto.role,
    });
    return toDto(entity);
  },

  update(id: string, dto: UpdateUserRequestDto): UserResponseDto {
    const existing = usersRepository.getById(id);
    if (!existing) throw ApiError.notFound("Користувача");

    const errors = collectErrors([
      dto.name !== undefined ? requireString(dto.name, "name", 2, 100) : null,
      dto.email !== undefined ? requireEmail(dto.email, "email") : null,
      dto.role !== undefined ? requireEnum(dto.role, "role", [...ROLES]) : null,
    ]);
    if (errors.length > 0) throw ApiError.validationError(errors);

    const updated = usersRepository.update(id, {
      ...(dto.name ? { name: dto.name.trim() } : {}),
      ...(dto.email ? { email: dto.email.trim().toLowerCase() } : {}),
      ...(dto.role ? { role: dto.role } : {}),
    });
    return toDto(updated!);
  },

  delete(id: string): void {
    const existing = usersRepository.getById(id);
    if (!existing) throw ApiError.notFound("Користувача");
    usersRepository.delete(id);
  },
};
