'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Profile, Puskesmas } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [puskesmas, setPuskesmas] = useState<Puskesmas | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(session.user)
          
          // Load profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            
          if (profileData) {
            setProfile(profileData as Profile)
            
            // Load puskesmas if user is assigned to one
            if (profileData.puskesmas_id) {
              const { data: puskesmasData } = await supabase
                .from('puskesmas')
                .select('*')
                .eq('id', profileData.puskesmas_id)
                .single()
                
              if (puskesmasData) {
                setPuskesmas(puskesmasData as Puskesmas)
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading session:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          // Profile reload would be needed if we want to reflect changes immediately,
          // but usually auth state change is just sign in/out
        } else {
          setUser(null)
          setProfile(null)
          setPuskesmas(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    // The auth state change listener will handle state cleanup
  }

  return {
    user,
    profile,
    puskesmas,
    loading,
    signOut,
    isSuperAdmin: profile?.role === 'super_admin',
    isAdmin: profile?.role === 'admin' || profile?.role === 'super_admin',
  }
}
