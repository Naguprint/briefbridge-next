import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sql = neon(process.env.POSTGRES_URL);
    const rows = await sql`SELECT * FROM briefs ORDER BY created_at DESC LIMIT 100;`;
    const briefs = rows.map(r => ({
      id: r.id,
      createdAt: Number(r.created_at),
      title: r.title,
      category: r.category,
      budgetMin: r.budget_min,
      budgetMax: r.budget_max,
      timeline: r.timeline,
      details: r.details,
      name: r.name,
      email: r.email
    }));
    return NextResponse.json({ briefs });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { brief } = await request.json();
    const sql = neon(process.env.POSTGRES_URL);
    
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 11);
    const createdAt = Date.now();
    
    await sql`
      INSERT INTO briefs (id, created_at, title, category, budget_min, budget_max, timeline, details, name, email)
      VALUES (${id}, ${createdAt}, ${brief.title}, ${brief.category},
              ${brief.budgetMin ?? null}, ${brief.budgetMax ?? null},
              ${brief.timeline}, ${brief.details}, ${brief.name ?? null}, ${brief.email ?? null});
    `;
    
    return NextResponse.json({ created: { id, createdAt, ...brief } });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}