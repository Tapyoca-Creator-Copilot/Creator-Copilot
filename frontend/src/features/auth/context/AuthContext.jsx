import { supabase } from '@/supabaseClient';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext()

export const AuthContextProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    // Sign up
    const signUpNewUser = async (name, email, password, occupation) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    occupation: occupation,
                }
            }
        });
        if (error) {
            console.error("Error signing up:", error);
            return { success: false, error };
        }
        return { success: true, data };
    };

    // Sign in
    const signInUser = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (error) {
                console.error("Error signing in:", error);
                return { success: false, error: error.message };
            }
            console.log("User signed in:", data);
            return { success: true, data };

        } catch (error) {
            console.error("Error signing in:", error);
        }
    }

    const signInWithGoogle = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
            },
        });

        if (error) {
            console.error("Error signing in with Google:", error);
            return { success: false, error };
        }

        return { success: true, data };
    };

    const sendPasswordResetEmail = async (email) => {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
            console.error("Error sending password reset email:", error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    };

    const updateUserPassword = async (password) => {
        const { data, error } = await supabase.auth.updateUser({ password });

        if (error) {
            console.error("Error updating password:", error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setIsAuthLoading(false);
        });

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setIsAuthLoading(false);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    },[])

    // Sign out
    const signOutUser = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error signing out:", error);
        }
    };
 
    return (
        <AuthContext.Provider value={{session, isAuthLoading, signUpNewUser, signInUser, signInWithGoogle, sendPasswordResetEmail, updateUserPassword, signOutUser}}>
            {children}
        </AuthContext.Provider>
    )
}

export const UserAuth = () => {
    return useContext(AuthContext)
}

export default AuthContext
