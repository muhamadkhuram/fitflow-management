-- Create attendance table for tracking member check-ins and check-outs
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.gym_members(id) ON DELETE CASCADE,
  check_in_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  check_out_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Owners can view their gym attendance" 
ON public.attendance 
FOR SELECT 
USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Owners can create attendance records" 
ON public.attendance 
FOR INSERT 
WITH CHECK (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Owners can update attendance records" 
ON public.attendance 
FOR UPDATE 
USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Owners can delete attendance records" 
ON public.attendance 
FOR DELETE 
USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

-- Create index for faster queries
CREATE INDEX idx_attendance_gym_id ON public.attendance(gym_id);
CREATE INDEX idx_attendance_member_id ON public.attendance(member_id);
CREATE INDEX idx_attendance_check_in_time ON public.attendance(check_in_time DESC);