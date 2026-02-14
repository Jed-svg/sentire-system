'use client'

import React from "react"

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { GraduationCap, Users, Shield, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react'
import type { UserRole } from '@/lib/types'

const ROLE_CONFIG: Record<UserRole, { icon: typeof GraduationCap; title: string; description: string }> = {
  student: {
    icon: GraduationCap,
    title: 'Student',
    description: 'Access your grades, attendance, and check-in',
  },
  teacher: {
    icon: Users,
    title: 'Teacher',
    description: 'Manage classes, grades, and student insights',
  },
  admin: {
    icon: Shield,
    title: 'Administrator',
    description: 'System management and analytics',
  },
}

export default function SignUpPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [studentId, setStudentId] = useState('')
  const [department, setDepartment] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) {
      setError('Please select your role first')
      return
    }

    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${window.location.origin}/auth/login`,
        data: {
          full_name: fullName,
          role: selectedRole,
          student_id: selectedRole === 'student' ? studentId : null,
          department: department || null,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setIsLoading(false)
      return
    }

    setIsSuccess(true)
    setIsLoading(false)
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="max-w-md w-full border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
                <CheckCircle className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Check your email</h2>
              <p className="text-muted-foreground mb-6">
                {"We've sent you a confirmation link to "}
                <span className="font-medium text-foreground">{email}</span>. 
                Please click the link to verify your account.
              </p>
              <Link href="/auth/login">
                <Button variant="outline" className="w-full bg-transparent">
                  Return to login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
              Join our academic monitoring platform
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

      {/* Right Panel - Sign Up Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 bg-background overflow-y-auto">
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
              <CardTitle className="text-2xl">Create an account</CardTitle>
              <CardDescription>Select your role and fill in your details</CardDescription>
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

              <form onSubmit={handleSignUp} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

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
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      minLength={6}
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

                {selectedRole === 'student' && (
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input
                      id="studentId"
                      type="text"
                      placeholder="Enter your student ID"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="department">Department (Optional)</Label>
                  <Input
                    id="department"
                    type="text"
                    placeholder="e.g., Computer Science"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading || !selectedRole}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create account'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-primary hover:underline font-medium">
                    Sign in
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
