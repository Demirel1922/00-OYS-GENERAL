import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { useUsersStore } from './usersStore';

interface AuthState {
  user: User | null;
  token: string | null;
  allowedModules: string[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      allowedModules: [],
      isAuthenticated: false,
      isAdmin: false,

      login: async (username: string, password: string) => {
        // usersStore'dan kullanıcıları al
        const users = useUsersStore.getState().users;
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
          set({
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              fullName: user.fullName,
              isAdmin: user.isAdmin,
              modules: user.modules,
            },
            token: 'token-' + Date.now(),
            allowedModules: user.modules,
            isAuthenticated: true,
            isAdmin: user.isAdmin,
          });
          return true;
        }
        return false;
      },

      logout: () => {
        set({
          user: null,
          token: null,
          allowedModules: [],
          isAuthenticated: false,
          isAdmin: false,
        });
      },

      checkAuth: () => {
        const { token } = get();
        if (!token) {
          set({
            user: null,
            isAuthenticated: false,
            isAdmin: false,
            allowedModules: [],
          });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
