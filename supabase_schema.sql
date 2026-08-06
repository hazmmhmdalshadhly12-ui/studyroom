-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- EXAMS TABLE
-- ============================================
CREATE TABLE exams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SUBMISSIONS TABLE
-- ============================================
CREATE TABLE submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  answers_data JSONB NOT NULL DEFAULT '[]',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(exam_id, student_id)
);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on both tables
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Exams: Anyone authenticated can read exams
CREATE POLICY "Allow authenticated users to read exams"
  ON exams FOR SELECT
  TO authenticated
  USING (true);

-- Exams: Only service role or admin can insert/update/delete
CREATE POLICY "Allow admin to manage exams"
  ON exams FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ));

-- Submissions: Students can only read their own submissions
CREATE POLICY "Allow students to read own submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- Submissions: Students can only insert their own submission once
CREATE POLICY "Allow students to insert own submission"
  ON submissions FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

-- Submissions: Admin can read all submissions
CREATE POLICY "Allow admin to read all submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ));