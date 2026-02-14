"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, GraduationCap, Heart, TrendingUp, AlertTriangle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalCheckins: number;
  emotionBreakdown: { emotion: string; count: number }[];
  enrollmentTrend: { month: string; count: number }[];
}

const EMOTION_COLORS: Record<string, string> = {
  happy: "#22c55e",
  neutral: "#3b82f6",
  sad: "#6366f1",
  stressed: "#f97316",
  tired: "#8b5cf6",
  angry: "#ef4444",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalCheckins: 0,
    emotionBreakdown: [],
    enrollmentTrend: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient();

      const [studentsRes, teachersRes, coursesRes, checkinsRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact" }).eq("role", "student"),
        supabase.from("profiles").select("id", { count: "exact" }).eq("role", "teacher"),
        supabase.from("courses").select("id", { count: "exact" }),
        supabase.from("emotion_checkins").select("*"),
      ]);

      const emotionCounts: Record<string, number> = {};
      checkinsRes.data?.forEach((checkin) => {
        emotionCounts[checkin.emotion] = (emotionCounts[checkin.emotion] || 0) + 1;
      });

      const emotionBreakdown = Object.entries(emotionCounts).map(([emotion, count]) => ({
        emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
        count,
      }));

      // Mock enrollment trend data
      const enrollmentTrend = [
        { month: "Sep", count: 45 },
        { month: "Oct", count: 62 },
        { month: "Nov", count: 78 },
        { month: "Dec", count: 85 },
        { month: "Jan", count: 92 },
        { month: "Feb", count: 98 },
      ];

      setStats({
        totalStudents: studentsRes.count || 0,
        totalTeachers: teachersRes.count || 0,
        totalCourses: coursesRes.count || 0,
        totalCheckins: checkinsRes.data?.length || 0,
        emotionBreakdown,
        enrollmentTrend,
      });
      setLoading(false);
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const atRiskCount = stats.emotionBreakdown
    .filter((e) => ["Sad", "Stressed", "Angry"].includes(e.emotion))
    .reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">System-wide overview and analytics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Enrolled in the system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeachers}</div>
            <p className="text-xs text-muted-foreground">Active instructors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At-Risk Students</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{atRiskCount}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Emotional Well-being Overview
            </CardTitle>
            <CardDescription>Distribution of student emotions across all check-ins</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.emotionBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.emotionBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ emotion, percent }) => `${emotion} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.emotionBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={EMOTION_COLORS[entry.emotion.toLowerCase()] || "#8884d8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No check-in data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Enrollment Trend
            </CardTitle>
            <CardDescription>Student enrollment over the past months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.enrollmentTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Quick overview of system metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-accent/50">
              <div className="p-2 rounded-full bg-accent">
                <Heart className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Wellbeing Check-ins</p>
                <p className="text-2xl font-bold">{stats.totalCheckins}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/10">
              <div className="p-2 rounded-full bg-primary/20">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Avg. Attendance</p>
                <p className="text-2xl font-bold">94%</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-chart-2/10">
              <div className="p-2 rounded-full bg-chart-2/20">
                <GraduationCap className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-sm font-medium">Pass Rate</p>
                <p className="text-2xl font-bold">87%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
