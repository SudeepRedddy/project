import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

// Interfaces for Student and University
interface Student {
  id: string;
  university_id: string;
  student_roll_number: string;
  student_name: string;
  student_email: string;
  created_at: string;
  university?: {
    id: string;
    name: string;
    address?: string;
  };
}

interface University {
  id: string;
  name: string;
  address?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  certificate_background?: string;
}

// The shape of our Authentication Context
interface AuthContextType {
  user: User | null;
  student: Student | null;
  university: University | null;
  role: 'university' | 'student' | null;
  loading: boolean;
  signUpAsUniversity: (data: { name: string; email: string; password: string }) => Promise<any>;
  loginAsUniversity: (data: { email: string; password: string }) => Promise<any>;
  loginAsStudent: (data: { email: string; rollNumber: string }) => Promise<any>;
  signOut: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>(null!);

// The AuthProvider component that will wrap our application
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [university, setUniversity] = useState<University | null>(null);
  const [role, setRole] = useState<'university' | 'student' | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to clear all authentication state
  const clearAuthState = useCallback(() => {
    setUser(null);
    setStudent(null);
    setUniversity(null);
    setRole(null);
    localStorage.removeItem('student_session');
  }, []);

  // Main effect for handling auth state changes and initial load
  useEffect(() => {
    setLoading(true);
    const studentSession = localStorage.getItem('student_session');
    if (studentSession) {
      setStudent(JSON.parse(studentSession));
      setRole('student');
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase.from('universities').select('*').eq('id', session.user.id).single()
          .then(({ data, error }) => {
            if (!error && data) {
              setUser(session.user);
              setUniversity(data);
              setRole('university');
            }
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          clearAuthState();
        } else if (session) {
           supabase.from('universities').select('*').eq('id', session.user.id).single()
          .then(({ data, error }) => {
            if (!error && data) {
              setUser(session.user);
              setUniversity(data);
              setRole('university');
            }
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [clearAuthState]);


  // --- AUTHENTICATION FUNCTIONS ---

  const signUpAsUniversity = async (data: { name: string; email: string; password: string }) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { name: data.name, role: 'university' } }
    });
    if (error) throw error;
    return authData;
  };

  const loginAsUniversity = async ({ email, password }: { email: string; password: string }) => {
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;

      const { data: profile, error: profileError } = await supabase
        .from('universities')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      if (profileError) throw profileError;

      setUser(authData.user);
      setUniversity(profile);
      setRole('university');
      localStorage.removeItem('student_session');
      return { user: authData.user, profile };
    } finally {
      setLoading(false);
    }
  };

  const loginAsStudent = async ({ email, rollNumber }: { email: string; rollNumber: string }) => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      clearAuthState();

      // Step 1: Find the student first.
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('student_email', email.trim().toLowerCase())
        .eq('student_roll_number', rollNumber.trim())
        .single();

      if (studentError || !studentData) {
        console.error("Student lookup failed:", studentError?.message);
        throw new Error("Invalid student credentials. Please check your email and roll number and try again.");
      }
      
      // Step 2: If student is found, get their university details.
      const { data: universityData, error: universityError } = await supabase
        .from('universities')
        .select('*')
        .eq('id', studentData.university_id)
        .single();
      
      // We can still log in the student even if the university lookup fails
      if (universityError) {
          console.warn("Could not fetch university for student:", universityError.message);
      }

      // Step 3: Combine the data and set the state.
      const fullStudentProfile = { ...studentData, university: universityData || undefined };

      localStorage.setItem('student_session', JSON.stringify(fullStudentProfile));
      setStudent(fullStudentProfile);
      setRole('student');
      return fullStudentProfile;

    } catch(error) {
        clearAuthState();
        throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    clearAuthState();
  };

  // The value provided to the context consumers
  const value = {
    user,
    student,
    university,
    role,
    loading,
    signUpAsUniversity,
    loginAsUniversity,
    loginAsStudent,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};