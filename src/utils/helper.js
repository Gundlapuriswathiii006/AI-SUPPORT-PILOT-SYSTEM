export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncate = (str, len = 80) => {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
};

export const getRoleDashboard = (role) => {
  switch (role) {
    case 'admin': return '/admin';
    case 'support': return '/support';
    default: return '/employee';
  }
};
