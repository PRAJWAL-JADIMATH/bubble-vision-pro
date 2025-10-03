-- Create answer_keys table for storing exam answer keys
CREATE TABLE public.answer_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_name TEXT NOT NULL,
  version TEXT NOT NULL,
  answers JSONB NOT NULL,
  total_questions INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(exam_name, version)
);

-- Create omr_evaluations table for storing evaluation results
CREATE TABLE public.omr_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  roll_number TEXT NOT NULL,
  exam_version TEXT NOT NULL,
  subject1_score INTEGER NOT NULL,
  subject2_score INTEGER NOT NULL,
  subject3_score INTEGER NOT NULL,
  subject4_score INTEGER NOT NULL,
  subject5_score INTEGER NOT NULL,
  total_score INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  detailed_results JSONB,
  confidence_score DECIMAL(5,4),
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.answer_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omr_evaluations ENABLE ROW LEVEL SECURITY;

-- Public read access for answer keys (evaluators need to read them)
CREATE POLICY "Allow public read access to answer keys" 
ON public.answer_keys 
FOR SELECT 
USING (true);

-- Public insert access for answer keys (evaluators can create them)
CREATE POLICY "Allow public insert access to answer keys" 
ON public.answer_keys 
FOR INSERT 
WITH CHECK (true);

-- Public read access for evaluations
CREATE POLICY "Allow public read access to evaluations" 
ON public.omr_evaluations 
FOR SELECT 
USING (true);

-- Public insert access for evaluations
CREATE POLICY "Allow public insert access to evaluations" 
ON public.omr_evaluations 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_answer_keys_updated_at
BEFORE UPDATE ON public.answer_keys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_omr_evaluations_updated_at
BEFORE UPDATE ON public.omr_evaluations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_answer_keys_version ON public.answer_keys(version);
CREATE INDEX idx_answer_keys_is_active ON public.answer_keys(is_active);
CREATE INDEX idx_omr_evaluations_roll_number ON public.omr_evaluations(roll_number);
CREATE INDEX idx_omr_evaluations_exam_version ON public.omr_evaluations(exam_version);
CREATE INDEX idx_omr_evaluations_created_at ON public.omr_evaluations(created_at DESC);