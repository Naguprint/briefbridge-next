import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sql = neon(process.env.POSTGRES_URL);
    const content = await sql`SELECT * FROM site_content`;
    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, content } = await request.json();
    const sql = neon(process.env.POSTGRES_URL);
    
    await sql`
      UPDATE site_content 
      SET content = ${JSON.stringify(content)},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}