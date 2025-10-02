import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Remove this line if it exists:
// const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  // ... existing GET code ...
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
    
    // Initialize Resend inside the function
    if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);  // ← Move initialization here
        
        await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: process.env.ADMIN_EMAIL,
          subject: `New Brief: ${brief.title}`,
          html: `
            <h2>New brief posted on BriefBridge</h2>
            <p><strong>Title:</strong> ${brief.title}</p>
            <p><strong>Category:</strong> ${brief.category}</p>
            <p><strong>Budget:</strong> €${brief.budgetMin || '?'} - €${brief.budgetMax || '?'}</p>
            <p><strong>Timeline:</strong> ${brief.timeline}</p>
            <p><strong>Details:</strong> ${brief.details}</p>
            <hr>
            <p><strong>Contact:</strong> ${brief.name || 'Not provided'} - ${brief.email || 'Not provided'}</p>
          `
        });
      } catch (emailError) {
        console.error('Email send failed:', emailError);
      }
    }
    
    return NextResponse.json({ created: { id, createdAt, ...brief } });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  // ... existing DELETE code ...
}

export async function PUT(request) {
  // ... existing PUT code ...
}