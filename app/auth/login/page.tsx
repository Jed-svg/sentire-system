'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { GraduationCap, Users, Shield, Loader2, Eye, EyeOff } from 'lucide-react'
import type { UserRole } from '@/lib/types'

const ROLE_CONFIG: Record<UserRole, { icon: typeof GraduationCap; title: string; description: string; color: string }> = {
  student: {
    icon: GraduationCap,
    title: 'Student',
    description: 'Access your grades, attendance, and check-in',
    color: 'bg-primary hover:bg-primary/90',
  },
  teacher: {
    icon: Users,
    title: 'Teacher',
    description: 'Manage classes, grades, and student insights',
    color: 'bg-accent hover:bg-accent/90',
  },
  admin: {
    icon: Shield,
    title: 'Administrator',
    description: 'System management and analytics',
    color: 'bg-sidebar hover:bg-sidebar/90',
  },
}

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) {
      setError('Please select your role first')
      return
    }

    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setIsLoading(false)
      return
    }

    // Verify user role matches selected role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile) {
      setError('Failed to verify your account. Please try again.')
      await supabase.auth.signOut()
      setIsLoading(false)
      return
    }

    if (profile.role !== selectedRole) {
      setError(`This account is registered as a ${profile.role}. Please select the correct role.`)
      await supabase.auth.signOut()
      setIsLoading(false)
      return
    }

    // Redirect based on role
    router.push(`/${selectedRole}`)
    router.refresh()
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center bg-primary p-12 text-primary-foreground">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-foreground/10 mb-6">
              <GraduationCap className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">SENTIRE</h1>
            <p className="text-lg text-primary-foreground/80">
              Academic Monitoring System with Emotional Well-being Tracking
            </p>
          </div>
          
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-foreground/10 flex items-center justify-center shrink-0 mt-0.5">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-medium">Track Academic Progress</h3>
                <p className="text-sm text-primary-foreground/70">Monitor grades, attendance, and performance in real-time</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-foreground/10 flex items-center justify-center shrink-0 mt-0.5">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-medium">Emotional Well-being</h3>
                <p className="text-sm text-primary-foreground/70">Daily check-ins with AI-powered insights and support</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-foreground/10 flex items-center justify-center shrink-0 mt-0.5">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-medium">Smart Analytics</h3>
                <p className="text-sm text-primary-foreground/70">AI-driven recommendations for improved outcomes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">SENTIRE</h1>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>Select your role and sign in to continue</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Role Selection */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {(Object.keys(ROLE_CONFIG) as UserRole[]).map((role) => {
                  const config = ROLE_CONFIG[role]
                  const Icon = config.icon
                  const isSelected = selectedRole === role
                  
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`
                        relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                        ${isSelected 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                        }
                      `}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-xs font-medium">{config.title}</span>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {selectedRole && (
                <p className="text-sm text-muted-foreground text-center mb-6">
                  {ROLE_CONFIG[selectedRole].description}
                </p>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading || !selectedRole}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {"Don't have an account? "}
                  <Link href="/auth/sign-up" className="text-primary hover:underline font-medium">
                    Sign up
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
