export const PERMISSIONS = {
  admin: ['manage_users', 'view_reports', 'manage_tickets', 'manage_kb', 'manage_settings'],
  support: ['resolve_tickets', 'view_analytics', 'reassign_tickets'],
  employee: ['create_tickets', 'view_own_tickets'],
};

export const hasPermission = (role, permission) => {
  return PERMISSIONS[role]?.includes(permission) ?? false;
};
