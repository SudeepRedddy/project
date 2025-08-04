import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface Student {
  id: string;
  university_id: string;
  student_roll_number: string;
  student_name: string;
  student_email: string;
  created_at: string;
  university?: {
    name: string;
  };
}

interface University {
  id: string;
  name: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  student: Student | null;
  university: University | null;
  role: 'university' | 'student' | null;
  loading: boolean;
  signUpAsUniversity: (data: { name: string; email: string; password: string }) => Promise<void>;
  loginAsUniversity: (data: { email: string; password: string }) => Promise<void>;
  loginAsStudent: (data: { email: string; rollNumber: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  student: null,
  university: null,
  role: null,
  loading: true,
  signUpAsUniversity: async () => {},
  loginAsUniversity: async () => {},
  loginAsStudent: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [university, setUniversity] = useState<University | null>(null);
  const [role, setRole] = useState<'university' | 'student' | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Check for student session first
        const studentData = localStorage.getItem('student_session');
        if (studentData && mounted) {
          try {
            const parsedStudent = JSON.parse(studentData);
            setStudent(parsedStudent);
            setRole('student');
            setLoading(false);
            return;
          } catch (err) {
            localStorage.removeItem('student_session');
          }
        }

        // Get Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          setUser(session.user);
          await loadUserProfile(session.user);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setUniversity(null);
          if (event === 'SIGNED_OUT') {
            setStudent(null);
            setRole(null);
            localStorage.removeItem('student_session');
          }
        } else if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user);
        }
        
        if (!student) {
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (user: User) => {
    try {
      const { data: universityData } = await supabase
        .from('universities')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (universityData) {
        setUniversity(universityData);
        setRole('university');
        setStudent(null);
        localStorage.removeItem('student_session');
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    }
  };

  const signUpAsUniversity = async ({ name, email, password }: { name: string; email: string; password: string }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'university'
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase
          .from('universities')
          .insert({
            id: data.user.id,
            name
          });

        if (profileError) {
          throw profileError;
        }
      }
    } catch (error) {
      console.error('University signup error:', error);
      throw error;
    }
  };

  const loginAsUniversity = async ({ email, password }: { email: string; password: string }) => {
    try {
      console.log('University login attempt:', email);
      
      // First, sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('No user data returned');
      }

      console.log('Auth successful, checking university profile...');

      // Check if this user has a university profile
      const { data: universityData, error: universityError } = await supabase
        .from('universities')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (universityError) {
        console.error('University query error:', universityError);
        await supabase.auth.signOut();
        throw new Error('Failed to verify university account');
      }

      if (!universityData) {
        console.log('No university profile found');
        await supabase.auth.signOut();
        throw new Error('This account is not registered as a university');
      }

      console.log('University login successful:', universityData);

      // Clear any student session
      localStorage.removeItem('student_session');
      
      // Set university state
      setUser(authData.user);
      setUniversity(universityData);
      setStudent(null);
      setRole('university');
      
    } catch (error) {
      console.error('University login error:', error);
      throw error;
    }
  };

  const loginAsStudent = async ({ email, rollNumber }: { email: string; rollNumber: string }) => {
    try {
      console.log('Student login attempt:', email, rollNumber);
      
      // Clear any existing sessions
      localStorage.removeItem('student_session');
      if (user) {
        await supabase.auth.signOut();
      }
      
      // Query for student
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select(`
          *,
          universities!inner(
            id,
            name,
            address
          )
        `)
        .eq('student_email', email.trim())
        .eq('student_roll_number', rollNumber.trim())
        .maybeSingle();

      if (studentError) {
        console.error('Student query error:', studentError);
        throw new Error('Failed to verify student credentials');
      }

      if (!studentData) {
        console.log('No student found with these credentials');
        throw new Error('Invalid student credentials. Please check your email and roll number.');
      }

      console.log('Student found:', studentData);
      
      // Store student session
      localStorage.setItem('student_session', JSON.stringify(studentData));
      
      // Clear university state
      setUser(null);
      setUniversity(null);
      
      // Set student state
      setStudent(studentData);
      setRole('student');
      
    } catch (error) {
      console.error('Student login error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      
      // Clear student session
      localStorage.removeItem('student_session');
      
      // Sign out from Supabase auth
      if (user) {
        await supabase.auth.signOut();
      }

      // Clear all state
      setUser(null);
      setStudent(null);
      setUniversity(null);
      setRole(null);
      
      console.log('Sign out complete');
    } catch (error) {
      console.error('Error in signOut:', error);
    }
  };

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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};