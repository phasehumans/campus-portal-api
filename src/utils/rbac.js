/**
 * RBAC Permissions Configuration
 * Defines what each role can do
 */
const PERMISSIONS = {
  student: {
    read: ['announcements', 'courses', 'materials', 'own_results', 'events'],
    write: ['own_profile'],
    delete: [],
  },
  faculty: {
    read: ['announcements', 'courses', 'materials', 'all_results', 'events', 'users_in_course'],
    write: ['announcements', 'materials', 'own_profile'],
    delete: ['own_materials'],
  },
  admin: {
    read: ['*'],
    write: ['*'],
    delete: ['*'],
  },
};

/**
 * Route-based access control
 * Maps routes to required roles
 */
const ROUTE_ROLES = {
  // Auth routes
  'POST /auth/register': ['public'],
  'POST /auth/login': ['public'],
  'GET /auth/me': ['student', 'faculty', 'admin'],

  // Announcement routes
  'GET /announcements': ['student', 'faculty', 'admin'],
  'POST /announcements': ['faculty', 'admin'],
  'PUT /announcements/:id': ['faculty', 'admin'],
  'DELETE /announcements/:id': ['faculty', 'admin'],

  // Results routes
  'GET /results': ['student', 'faculty', 'admin'],
  'GET /results/:studentId': ['student', 'faculty', 'admin'],
  'POST /results': ['admin'],
  'PUT /results/:id': ['admin'],
  'DELETE /results/:id': ['admin'],

  // Courses routes
  'GET /courses': ['student', 'faculty', 'admin'],
  'POST /courses': ['admin'],
  'PUT /courses/:id': ['admin'],
  'DELETE /courses/:id': ['admin'],

  // Materials routes
  'GET /courses/:courseId/materials': ['student', 'faculty', 'admin'],
  'POST /courses/:courseId/materials': ['faculty', 'admin'],
  'PUT /courses/:courseId/materials/:materialId': ['faculty', 'admin'],
  'DELETE /courses/:courseId/materials/:materialId': ['faculty', 'admin'],

  // Admin routes
  'GET /admin/users': ['admin'],
  'PUT /admin/users/:id/role': ['admin'],
  'DELETE /admin/users/:id': ['admin'],
  'GET /admin/stats': ['admin'],
};

/**
 * Check if role has permission
 */
const hasPermission = (role, resource, action) => {
  const rolePerms = PERMISSIONS[role];
  if (!rolePerms) return false;

  const actionPerms = rolePerms[action];
  if (!actionPerms) return false;

  // Admin has all permissions
  if (role === 'admin') return true;

  // Check if resource is in permissions
  return actionPerms.includes(resource) || actionPerms.includes('*');
};

/**
 * Check if role can access route
 */
const canAccessRoute = (role, method, path) => {
  const route = `${method} ${path}`;

  // Check exact match first
  if (ROUTE_ROLES[route]) {
    return ROUTE_ROLES[route].includes(role) || ROUTE_ROLES[route].includes('public');
  }

  // Check pattern match
  for (const [routePattern, allowedRoles] of Object.entries(ROUTE_ROLES)) {
    const [routeMethod, routePath] = routePattern.split(' ');
    if (routeMethod === method && matchPath(routePath, path)) {
      return allowedRoles.includes(role);
    }
  }

  return false;
};

/**
 * Simple path pattern matcher
 */
const matchPath = (pattern, path) => {
  const patternRegex = pattern
    .replace(/\//g, '\\/')
    .replace(/:[^/]+/g, '[^/]+');
  return new RegExp(`^${patternRegex}$`).test(path);
};

module.exports = {
  PERMISSIONS,
  ROUTE_ROLES,
  hasPermission,
  canAccessRoute,
};
