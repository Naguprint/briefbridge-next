import { Resend } from 'resend';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);  // ← Initialize here
    
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.ADMIN_EMAIL,
      subject: 'Test Email from BriefBridge',
      html: '<p>This is a test email. If you receive this, Resend is working!</p>'
    });
    
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      hasApiKey: !!process.env.RESEND_API_KEY,
      hasAdminEmail: !!process.env.ADMIN_EMAIL
    }, { status: 500 });
  }
}