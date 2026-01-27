import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { notifyWorkerNewAppointment } from '@/lib/notifications';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  console.log('=== API ROUTE STARTED ===');
  
  try {
    // Check env vars first
    console.log('Env check:', {
      hasUrl: !!process.env.SUPABASE_URL,
      hasKey: !!process.env.SUPABASE_ANON_KEY
    });

    const body = await request.json();
    console.log('Received body:', body);
    
    const { date, service, clientName, worker } = body;

    // ✅ Validate required fields
    if (!date || !service || !clientName || !worker) {
      console.log('Validation failed:', { date, service, clientName, worker });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('About to insert into Supabase...');
    
    // 1️⃣ Insert appointment
    const { data: appointment, error: insertError } = await supabase
      .from('appointments')
      .insert({
        worker,
        date,
        service,
        customer_name: clientName,
      })
      .select()
      .single();

    console.log('Insert result:', { appointment, insertError });

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    // 2️⃣ Send push notification
    try {
      const dateObj = new Date(date);
      await notifyWorkerNewAppointment('dina', {
        service,
        date: dateObj.toLocaleDateString(),
        time: dateObj.toLocaleTimeString(),
        customerName: clientName,
      });
      console.log('Notification sent successfully');
    } catch (notifError) {
      console.error('Notification error (non-fatal):', notifError);
      // Don't fail the request if notification fails
    }

    console.log('=== API ROUTE SUCCESS ===');
    
    return NextResponse.json({
      success: true,
      appointment,
    });
  } catch (err: any) {
    console.error('=== UNEXPECTED ERROR ===');
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}