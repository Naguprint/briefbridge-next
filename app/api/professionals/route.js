import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sql = neon(process.env.POSTGRES_URL);
    const pros = await sql`SELECT * FROM professionals ORDER BY rating DESC`;
    return NextResponse.json({ pros });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { professional } = await request.json();
    const sql = neon(process.env.POSTGRES_URL);
    
    const result = await sql`
      INSERT INTO professionals (name, tags, rating, projects, featured)
      VALUES (${professional.name}, ${professional.tags}, ${professional.rating}, 
              ${professional.projects}, ${professional.featured})
      RETURNING *
    `;
    
    return NextResponse.json({ professional: result[0] });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { professional } = await request.json();
    const sql = neon(process.env.POSTGRES_URL);
    
    await sql`
      UPDATE professionals 
      SET name = ${professional.name},
          tags = ${professional.tags},
          rating = ${professional.rating},
          projects = ${professional.projects},
          featured = ${professional.featured}
      WHERE id = ${professional.id}
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    const sql = neon(process.env.POSTGRES_URL);
    await sql`DELETE FROM professionals WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}