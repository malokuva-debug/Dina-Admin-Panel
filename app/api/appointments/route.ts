import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { notifyWorkerNewAppointment } from '@/lib/notifications';

export async function POST(request: Request) {
  console.log('=== API ROUTE STARTED ===');
  
  try {
    console.log('Step 1: Parsing body...');
    const body = await request.json();
    console.log('Body parsed:', body);
    
    const { date, service, clientName, worker, price = 0 } = body;

    console.log('Step 2: Validating fields...');
    if (!date || !service || !clientName || !worker) {
      console.log('Validation failed:', { date, service, clientName, worker });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Extract date and time from the ISO string
    const dateObj = new Date(date);
    const dateString = dateObj.toISOString().split('T')[0]; // "2026-01-27"
    const timeString = dateObj.toTimeString().slice(0, 5); // "14:30"

    console.log('Step 3: Inserting into database...');
    const insertData = {
      worker,
      date: dateString,
      time: timeString,
      service,
      price: price,
      customer_name: clientName,
    };
    console.log('Data to insert:', insertData);
    
    const { data: appointment, error: insertError } = await supabase
      .from('appointments')
      .insert(insertData)
      .select()
      .single();

    console.log('Step 4: Insert complete');
    console.log('Result:', { appointment, insertError });

    if (insertError) {
      console.error('Insert error details:', JSON.stringify(insertError, null, 2));
      return NextResponse.json(
        { error: insertError.message, details: insertError },
        { status: 500 }
      );
    }

    // 5️⃣ Send push notification
    try {
      await notifyWorkerNewAppointment('dina', {
        service,
        date: dateObj.toLocaleDateString(),
        time: timeString,
        customerName: clientName,
      });
      console.log('Notification sent successfully');
    } catch (notifError) {
      console.error('Notification error (non-fatal):', notifError);
    }

    console.log('=== SUCCESS ===');
    
    return NextResponse.json({
      success: true,
      appointment,
    });
  } catch (err: any) {
    console.error('=== CAUGHT ERROR ===');
    console.error('Message:', err?.message);
    console.error('Stack:', err?.stack);
    console.error('Full:', err);
    
    return NextResponse.json(
      { 
        error: err?.message || 'Unknown error',
        details: String(err)
      },
      { status: 500 }
    );
  }
}