import type { User } from '../types/index.js';

/**
 * In-memory users database
 * In production, passwords would be hashed with bcrypt
 */
export const users: User[] = [
  {
    id: '1',
    email: 'admin@warehouse.com',
    password: 'admin123', // In production, this would be hashed
    name: 'System Administrator',
    role: 'admin',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    email: 'manager@warehouse.com',
    password: 'manager123',
    name: 'Warehouse Manager',
    role: 'manager',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    email: 'operator@warehouse.com',
    password: 'operator123',
    name: 'Warehouse Operator',
    role: 'operator',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: '4',
    email: 'demo@warehouse.com',
    password: 'demo',
    name: 'Demo User',
    role: 'manager',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
  },
];

/**
 * Find user by email
 */
export function findUserByEmail(email: string): User | undefined {
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

/**
 * Find user by ID
 */
export function findUserById(id: string): User | undefined {
  return users.find(u => u.id === id);
}

/**
 * Validate user credentials
 */
export function validateCredentials(email: string, password: string): User | null {
  const user = findUserByEmail(email);
  if (!user) return null;
  
  // In production, use bcrypt.compare
  if (user.password !== password) return null;
  
  return user;
}

/**
 * Remove password from user object
 */
export function sanitizeUser(user: User): Omit<User, 'password'> {
  const { password: _, ...safeUser } = user;
  return safeUser;
}
