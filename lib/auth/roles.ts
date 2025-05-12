/**
 * User role enum
 */
export enum UserRole {
  VIEWER = "viewer",
  EDITOR = "editor",
  PUBLISHER = "publisher",
  ADMIN = "admin",
}

/**
 * Permission enum
 */
export enum Permission {
  VIEW_CONTENT = "view_content",
  CREATE_DRAFT = "create_draft",
  EDIT_DRAFT = "edit_draft",
  PUBLISH_CONTENT = "publish_content",
  ARCHIVE_CONTENT = "archive_content",
  DELETE_CONTENT = "delete_content",
  MANAGE_USERS = "manage_users",
  MANAGE_SETTINGS = "manage_settings",
}

/**
 * Role permissions mapping
 */
export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.VIEWER]: [Permission.VIEW_CONTENT],
  [UserRole.EDITOR]: [Permission.VIEW_CONTENT, Permission.CREATE_DRAFT, Permission.EDIT_DRAFT],
  [UserRole.PUBLISHER]: [
    Permission.VIEW_CONTENT,
    Permission.CREATE_DRAFT,
    Permission.EDIT_DRAFT,
    Permission.PUBLISH_CONTENT,
    Permission.ARCHIVE_CONTENT,
  ],
  [UserRole.ADMIN]: [
    Permission.VIEW_CONTENT,
    Permission.CREATE_DRAFT,
    Permission.EDIT_DRAFT,
    Permission.PUBLISH_CONTENT,
    Permission.ARCHIVE_CONTENT,
    Permission.DELETE_CONTENT,
    Permission.MANAGE_USERS,
    Permission.MANAGE_SETTINGS,
  ],
}

/**
 * Check if a role has a permission
 * @param role User role
 * @param permission Permission to check
 * @returns Whether the role has the permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role].includes(permission)
}

/**
 * Get all permissions for a role
 * @param role User role
 * @returns Array of permissions
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
  return rolePermissions[role]
}

/**
 * Check if a role has all permissions
 * @param role User role
 * @param permissions Permissions to check
 * @returns Whether the role has all permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission))
}

/**
 * Check if a role has any of the permissions
 * @param role User role
 * @param permissions Permissions to check
 * @returns Whether the role has any of the permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission))
}
