import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, service, clientName, worker, price = 0 } = body;

    if (!date || !service || !clientName || !worker) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const dateObj = new Date(date);
    const dateString = dateObj.toISOString().split('T')[0];
    const timeString = dateObj.toTimeString().slice(0, 5);

    // Just insert - the trigger will send instant notification
    const { data: appointment, error: insertError } = await supabase
      .from('appointments')
      .insert({
        worker,
        date: dateString,
        time: timeString,
        service,
        price: price,
        customer_name: clientName,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      appointment,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}