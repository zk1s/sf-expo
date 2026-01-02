import { login as apiLogin } from '@/api/api';
import { clearCookie, setCookie, setCookieListener } from '@/api/client';
import { AuthState, User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSession();

        setCookieListener((newCookie) => {
            AsyncStorage.setItem('session_cookie', newCookie);
        });
    }, []);

    const loadSession = async () => {
        try {
            const [storedUser, storedCookie] = await Promise.all([
                AsyncStorage.getItem('user'),
                AsyncStorage.getItem('session_cookie')
            ]);

            if (storedUser && storedCookie) {
                setUser(JSON.parse(storedUser));
                setCookie(storedCookie);
            }
        } catch (e) {
            console.error('Failed to load session', e);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (username: string, password: string) => {
        setIsLoading(true);
        try {
            const success = await apiLogin(username, password);
            if (success) {
                const newUser = { username };
                setUser(newUser);
                await AsyncStorage.setItem('user', JSON.stringify(newUser));
            } else {
                throw new Error('Login failed');
            }
        } catch (e) {
            console.error(e);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        clearCookie();
        setUser(null);
        await AsyncStorage.multiRemove(['user', 'session_cookie']);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
