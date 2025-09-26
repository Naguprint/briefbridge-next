import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    const sql = neon(process.env.POSTGRES_URL);
    
    await sql`DELETE FROM briefs WHERE id = ${id}`;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}