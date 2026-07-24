import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExportRequest {
  export_type: 'attendance' | 'grades' | 'students' | 'courses' | 'full';
  filters?: {
    start_date?: string;
    end_date?: string;
    class_id?: number;
    student_id?: string;
  };
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    // Set the auth context for supabase
    supabase.auth.setAuth(authHeader.replace('Bearer ', ''));

    const { export_type, filters }: ExportRequest = await req.json();

    console.log('Export request:', { export_type, filters });

    // Create export record
    const { data: exportRecord, error: exportError } = await supabase
      .rpc('request_data_export', { 
        p_export_type: export_type, 
        p_filters: filters ? JSON.stringify(filters) : null 
      });

    if (exportError) {
      console.error('Error creating export record:', exportError);
      throw exportError;
    }

    console.log('Export record created:', exportRecord);

    // Generate the actual data based on export type
    let csvData = '';
    let fileName = '';

    switch (export_type) {
      case 'attendance':
        csvData = await generateAttendanceCSV(filters);
        fileName = `attendance_export_${new Date().toISOString().split('T')[0]}.csv`;
        break;
        
      case 'students':
        csvData = await generateStudentsCSV(filters);
        fileName = `students_export_${new Date().toISOString().split('T')[0]}.csv`;
        break;
        
      case 'courses':
        csvData = await generateCoursesCSV(filters);
        fileName = `courses_export_${new Date().toISOString().split('T')[0]}.csv`;
        break;
        
      case 'full':
        csvData = await generateFullExportCSV(filters);
        fileName = `full_export_${new Date().toISOString().split('T')[0]}.csv`;
        break;
        
      default:
        throw new Error(`Export type ${export_type} not supported yet`);
    }

    // Update export record with completion
    const { error: updateError } = await supabase
      .from('data_exports')
      .update({ 
        status: 'completed',
        file_size: new Blob([csvData]).size 
      })
      .eq('id', exportRecord);

    if (updateError) {
      console.error('Error updating export record:', updateError);
    }

    console.log('Export completed successfully');

    // Return the CSV data
    return new Response(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        ...corsHeaders,
      },
    });

  } catch (error: unknown) {
    console.error('Error in export-data function:', error);
    
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

async function generateAttendanceCSV(filters?: any): Promise<string> {
  console.log('Generating attendance CSV with filters:', filters);
  
  let query = supabase
    .from('attendance_records')
    .select(`
      *,
      attendance_sessions!inner(
        subject,
        session_date,
        start_time,
        end_time,
        classes!inner(name)
      ),
      profiles!attendance_records_student_id_fkey(
        first_name,
        last_name
      )
    `);

  if (filters?.start_date) {
    query = query.gte('attendance_sessions.session_date', filters.start_date);
  }
  if (filters?.end_date) {
    query = query.lte('attendance_sessions.session_date', filters.end_date);
  }
  if (filters?.class_id) {
    query = query.eq('attendance_sessions.class_id', filters.class_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching attendance data:', error);
    throw error;
  }

  const headers = ['Date', 'Heure', 'Matière', 'Classe', 'Étudiant', 'Statut', 'Heure d\'arrivée', 'Notes'];
  let csv = headers.join(',') + '\n';

  data?.forEach(record => {
    const row = [
      record.attendance_sessions.session_date,
      record.attendance_sessions.start_time,
      record.attendance_sessions.subject,
      record.attendance_sessions.classes.name,
      `${record.profiles?.first_name || ''} ${record.profiles?.last_name || ''}`.trim(),
      record.status,
      record.arrival_time || '',
      record.notes || ''
    ];
    csv += row.map(field => `"${field}"`).join(',') + '\n';
  });

  return csv;
}

async function generateStudentsCSV(filters?: any): Promise<string> {
  console.log('Generating students CSV with filters:', filters);
  
  let query = supabase
    .from('profiles')
    .select(`
      *,
      user_roles!inner(role_name),
      student_enrollments(
        classes(name, academic_levels(name))
      )
    `)
    .eq('user_roles.role_name', 'student');

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching students data:', error);
    throw error;
  }

  const headers = ['Prénom', 'Nom', 'Email', 'Classe', 'Niveau', 'Date d\'inscription'];
  let csv = headers.join(',') + '\n';

  data?.forEach(student => {
    const enrollment = student.student_enrollments?.[0];
    const row = [
      student.first_name || '',
      student.last_name || '',
      '', // Email not directly available from profiles
      enrollment?.classes?.name || '',
      enrollment?.classes?.academic_levels?.name || '',
      student.created_at.split('T')[0]
    ];
    csv += row.map(field => `"${field}"`).join(',') + '\n';
  });

  return csv;
}

async function generateCoursesCSV(filters?: any): Promise<string> {
  console.log('Generating courses CSV with filters:', filters);
  
  let query = supabase
    .from('courses')
    .select(`
      *,
      classes(name, academic_levels(name)),
      profiles!courses_teacher_id_fkey(first_name, last_name),
      course_schedules(day_of_week, start_time, end_time, room)
    `);

  if (filters?.class_id) {
    query = query.eq('class_id', filters.class_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching courses data:', error);
    throw error;
  }

  const headers = ['Code', 'Nom', 'Description', 'Classe', 'Professeur', 'Année académique', 'Semestre', 'Crédits', 'Horaires'];
  let csv = headers.join(',') + '\n';

  data?.forEach(course => {
    const schedules = course.course_schedules?.map(s => 
      `${getDayName(s.day_of_week)} ${s.start_time}-${s.end_time} (${s.room || 'N/A'})`
    ).join('; ') || '';

    const row = [
      course.code,
      course.name,
      course.description || '',
      course.classes?.name || '',
      `${course.profiles?.first_name || ''} ${course.profiles?.last_name || ''}`.trim(),
      course.academic_year,
      course.semester || '',
      course.credits?.toString() || '',
      schedules
    ];
    csv += row.map(field => `"${field}"`).join(',') + '\n';
  });

  return csv;
}

async function generateFullExportCSV(filters?: any): Promise<string> {
  console.log('Generating full export CSV');
  
  // For full export, we'll combine multiple sections
  let csv = '=== EXPORT COMPLET ===\n\n';
  
  csv += '=== ÉTUDIANTS ===\n';
  csv += await generateStudentsCSV(filters);
  
  csv += '\n=== COURS ===\n';
  csv += await generateCoursesCSV(filters);
  
  csv += '\n=== PRÉSENCES ===\n';
  csv += await generateAttendanceCSV(filters);
  
  return csv;
}

function getDayName(dayOfWeek: number): string {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  return days[dayOfWeek] || 'Inconnu';
}

serve(handler);