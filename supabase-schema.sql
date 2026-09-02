-- ==============================================================================
-- SAMARTH eGOV / KUMAUN UNIVERSITY SUPABASE DATABASE SCHEMA
-- Execute this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Students Table
CREATE TABLE IF NOT EXISTS public.students (
    enrolment TEXT PRIMARY KEY,
    roll_no TEXT,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    father_name TEXT,
    mother_name TEXT,
    gender TEXT DEFAULT 'Male',
    dob TEXT,
    blood_group TEXT DEFAULT 'B+',
    category TEXT DEFAULT 'General',
    email TEXT,
    mobile TEXT,
    programme TEXT DEFAULT 'Bachelor of Commerce (B.COM.)',
    batch TEXT DEFAULT '2022 – 2024',
    college TEXT DEFAULT 'Sardar Bhagat Singh Govt. P.G. College Rudrapur',
    status TEXT DEFAULT 'Graduated / Passout (First Division)',
    photo TEXT DEFAULT 'assets/student_photo.png',
    exam_result TEXT DEFAULT 'FIRST DIVISION (684/900 - 76.0%)',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Grade Cards Table
CREATE TABLE IF NOT EXISTS public.grade_cards (
    id TEXT PRIMARY KEY,
    enrolment TEXT REFERENCES public.students(enrolment) ON DELETE CASCADE,
    programme TEXT DEFAULT 'B.COM',
    term TEXT NOT NULL,
    term_type TEXT DEFAULT 'YEAR',
    year TEXT NOT NULL,
    result TEXT,
    pdf_url TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Helpdesk & Grievances Table
CREATE TABLE IF NOT EXISTS public.grievance_tickets (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    student_name TEXT,
    category TEXT NOT NULL,
    priority TEXT DEFAULT 'Normal',
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    admin_reply TEXT,
    created_at TEXT,
    resolved_at TEXT
);

-- Enable Row Level Security (RLS) but allow Public / Anon Read & Write for the web portal
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievance_tickets ENABLE ROW LEVEL SECURITY;

-- Create Policies for Anon / Publishable Client Access
CREATE POLICY "Allow public read on students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on students" ON public.students FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read on grade_cards" ON public.grade_cards FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on grade_cards" ON public.grade_cards FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read on grievance_tickets" ON public.grievance_tickets FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on grievance_tickets" ON public.grievance_tickets FOR ALL USING (true) WITH CHECK (true);

-- Insert Default Seed Student: Mohd Mohsin Khan
INSERT INTO public.students (
    enrolment, roll_no, password, name, father_name, gender, dob, email, mobile, 
    category, blood_group, programme, college, batch, status, photo, exam_result
) VALUES (
    'KU20247319', '2233524680', 'Mohsin@8080', 'MOHD MOHSIN KHAN', 'BABBAN KHAN', 
    'MALE', '2001-02-22', 'Mohsinkhann495@gmail.com', '+91 96909 41117', 
    'General / Minority', 'B+', 'Bachelor of Commerce (B.COM.)', 
    'Sardar Bhagat Singh Govt. P.G. College Rudrapur U.S. Nagar', '2022 – 2024', 
    'Graduated / Passout (First Division)', 'assets/student_photo.png', 'FIRST DIVISION (684/900 - 76.0%)'
) ON CONFLICT (enrolment) DO NOTHING;

-- Insert Default Grade Cards
INSERT INTO public.grade_cards (id, enrolment, programme, term, term_type, year, result, pdf_url)
VALUES 
    ('gc-1', 'KU20247319', 'B.COM', '1', 'YEAR', '2022', 'PASS (222/300)', 'assets/gradecards/BCOM_PART1_2022.pdf'),
    ('gc-2', 'KU20247319', 'B.COM', '2', 'YEAR', '2023', 'PASS (230/300)', 'assets/gradecards/BCOM_PART2_2023.pdf'),
    ('gc-3', 'KU20247319', 'B.COM', '3', 'YEAR', '2024', 'FIRST DIVISION (232/300 - Total 684/900)', 'assets/gradecards/BCOM_PART3_2024.pdf')
ON CONFLICT (id) DO NOTHING;

-- Insert Default Grievance Ticket
INSERT INTO public.grievance_tickets (id, student_id, student_name, category, priority, subject, description, status, created_at, admin_reply)
VALUES (
    'TKT-1082', 'KU20247319', 'MOHD MOHSIN KHAN', 'Degree / Marksheet', 'High',
    'Request for Original Degree Certificate dispatch',
    'I have completed my B.Com (Final Year 2024) with First Division. Kindly issue my original degree certificate.',
    'In Progress', '2024-08-15 11:30 AM',
    'Verification completed by Examination Cell. Degree dispatched to your registered address.'
) ON CONFLICT (id) DO NOTHING;
