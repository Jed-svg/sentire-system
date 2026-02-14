-- SENTIRE Academic Monitoring System Schema

-- Users/Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null check (role in ('student', 'teacher', 'admin')),
  student_id text,
  department text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "profiles_select" on public.profiles for select to authenticated using (true);
create policy "profiles_insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update to authenticated using (auth.uid() = id);

-- Courses table
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  teacher_id uuid references public.profiles(id) on delete set null,
  semester text,
  created_at timestamptz default now()
);

alter table public.courses enable row level security;
create policy "courses_all" on public.courses for all to authenticated using (true) with check (true);

-- Student Enrollments
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz default now(),
  unique(student_id, course_id)
);

alter table public.enrollments enable row level security;
create policy "enrollments_all" on public.enrollments for all to authenticated using (true) with check (true);

-- Grades table
create table if not exists public.grades (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  assessment_name text not null,
  score decimal(5,2),
  max_score decimal(5,2) default 100,
  remarks text,
  recorded_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

alter table public.grades enable row level security;
create policy "grades_all" on public.grades for all to authenticated using (true) with check (true);

-- Attendance table
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  date date not null,
  status text not null check (status in ('present', 'absent', 'late', 'excused')),
  recorded_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  unique(student_id, course_id, date)
);

alter table public.attendance enable row level security;
create policy "attendance_all" on public.attendance for all to authenticated using (true) with check (true);

-- Emotion Check-ins table
create table if not exists public.emotion_checkins (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  emotion text not null check (emotion in ('happy', 'neutral', 'sad', 'stressed', 'tired', 'angry')),
  reason text,
  ai_analysis text,
  ai_suggestions text,
  checked_in_at timestamptz default now()
);

alter table public.emotion_checkins enable row level security;
create policy "emotion_checkins_all" on public.emotion_checkins for all to authenticated using (true) with check (true);

-- Announcements table
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  author_id uuid references public.profiles(id) on delete set null,
  target_role text check (target_role in ('all', 'student', 'teacher')),
  created_at timestamptz default now()
);

alter table public.announcements enable row level security;
create policy "announcements_all" on public.announcements for all to authenticated using (true) with check (true);

-- AI Insights table
create table if not exists public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  insight_type text not null check (insight_type in ('student_summary', 'class_summary', 'risk_alert', 'recommendation')),
  target_id uuid,
  content text not null,
  metadata jsonb,
  generated_at timestamptz default now()
);

alter table public.ai_insights enable row level security;
create policy "ai_insights_all" on public.ai_insights for all to authenticated using (true) with check (true);

-- Create trigger for auto-creating profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, student_id, department)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'New User'),
    coalesce(new.raw_user_meta_data ->> 'role', 'student'),
    new.raw_user_meta_data ->> 'student_id',
    new.raw_user_meta_data ->> 'department'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
