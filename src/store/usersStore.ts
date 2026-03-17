import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

export interface UserWithModules extends User {
  password?: string;
}

interface UsersState {
  users: UserWithModules[];
  addUser: (user: Omit<UserWithModules, 'id'>) => void;
  updateUser: (id: string, updates: Partial<UserWithModules>) => void;
  deleteUser: (id: string) => void;
  getUserById: (id: string) => UserWithModules | undefined;
}

// Varsayılan kullanıcılar
const DEFAULT_USERS: UserWithModules[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@oys.com',
    fullName: 'Admin User',
    isAdmin: true,
    modules: ['all'],
    password: 'admin123',
  },
  {
    id: '2',
    username: 'user',
    email: 'user@oys.com',
    fullName: 'Normal User',
    isAdmin: false,
    modules: ['1', '1a', '1b', '1c', '1d', '1e', '1f', '2', '3', '3a', '3b', '4', '4a', '4b', '4c', '5', '6', '7', '9', '11', '11a', '11a1', '11a2', '11a3', '11a4'],
    password: 'user123',
  },
];

export const useUsersStore = create<UsersState>()(
  persist(
    (set, get) => ({
      users: DEFAULT_USERS,

      addUser: (userData) => {
        const newUser: UserWithModules = {
          ...userData,
          id: crypto.randomUUID(),
        };
        set((state) => ({
          users: [...state.users, newUser],
        }));
      },

      updateUser: (id, updates) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, ...updates } : user
          ),
        }));
      },

      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
        }));
      },

      getUserById: (id) => {
        return get().users.find((user) => user.id === id);
      },
    }),
    {
      name: 'users-storage',
    }
  )
);
