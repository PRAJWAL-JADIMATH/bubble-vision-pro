import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { imageBase64, studentName, rollNumber, examVersion } = await req.json();

    console.log('Processing OMR for student:', studentName);

    // Fetch answer key for the exam version
    const { data: answerKey, error: keyError } = await supabase
      .from('answer_keys')
      .select('*')
      .eq('version', examVersion)
      .eq('is_active', true)
      .single();

    if (keyError || !answerKey) {
      console.error('Answer key not found:', keyError);
      return new Response(
        JSON.stringify({ error: 'Answer key not found for this exam version' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process image with AI vision model
    const prompt = `You are an OMR (Optical Mark Recognition) sheet evaluator. Analyze this OMR answer sheet image and extract the marked answers.

The sheet has 5 subjects with 20 questions each (100 questions total):
- Subject 1: Questions 1-20
- Subject 2: Questions 21-40
- Subject 3: Questions 41-60
- Subject 4: Questions 61-80
- Subject 5: Questions 81-100

For each question, identify which option (A, B, C, or D) is marked. If no option is clearly marked or multiple options are marked, return "INVALID".

Return ONLY a JSON object in this exact format:
{
  "answers": {
    "1": "A",
    "2": "B",
    ...
    "100": "D"
  },
  "confidence": 0.95
}

Be extremely accurate. If you're unsure about any answer, mark it as "INVALID".`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
              }
            ]
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI processing failed:', aiResponse.status, errorText);
      throw new Error('Failed to process OMR image with AI');
    }

    const aiData = await aiResponse.json();
    const resultText = aiData.choices[0].message.content;
    
    // Extract JSON from the response
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }
    
    const extractedData = JSON.parse(jsonMatch[0]);
    const studentAnswers = extractedData.answers;
    const confidence = extractedData.confidence || 0;

    // Calculate scores
    const correctAnswers = answerKey.answers as Record<string, string>;
    const subjectScores: Record<string, number> = {
      subject1: 0,
      subject2: 0,
      subject3: 0,
      subject4: 0,
      subject5: 0,
    };

    let totalCorrect = 0;
    const detailedResults: Record<string, any> = {};

    for (let i = 1; i <= 100; i++) {
      const questionNum = i.toString();
      const studentAnswer = studentAnswers[questionNum];
      const correctAnswer = correctAnswers[questionNum];
      
      const isCorrect = studentAnswer === correctAnswer && studentAnswer !== 'INVALID';
      
      detailedResults[questionNum] = {
        studentAnswer,
        correctAnswer,
        isCorrect,
      };

      if (isCorrect) {
        totalCorrect++;
        // Determine which subject (20 questions each)
        const subjectIndex = Math.floor((i - 1) / 20) + 1;
        const subjectKey = `subject${subjectIndex}`;
        subjectScores[subjectKey]++;
      }
    }

    const totalScore = totalCorrect;
    const percentage = (totalCorrect / 100) * 100;

    // Store evaluation result
    const { data: evaluation, error: evalError } = await supabase
      .from('omr_evaluations')
      .insert({
        student_name: studentName,
        roll_number: rollNumber,
        exam_version: examVersion,
        subject1_score: subjectScores.subject1,
        subject2_score: subjectScores.subject2,
        subject3_score: subjectScores.subject3,
        subject4_score: subjectScores.subject4,
        subject5_score: subjectScores.subject5,
        total_score: totalScore,
        percentage: percentage,
        detailed_results: detailedResults,
        confidence_score: confidence,
        status: confidence >= 0.85 ? 'completed' : 'needs_review',
      })
      .select()
      .single();

    if (evalError) {
      console.error('Failed to store evaluation:', evalError);
      throw new Error('Failed to store evaluation result');
    }

    return new Response(
      JSON.stringify({
        success: true,
        evaluation: {
          id: evaluation.id,
          studentName,
          rollNumber,
          examVersion,
          subjectScores,
          totalScore,
          percentage,
          confidence,
          status: evaluation.status,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing OMR:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
