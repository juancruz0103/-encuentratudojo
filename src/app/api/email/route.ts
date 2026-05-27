import { NextRequest, NextResponse } from 'next/server'

const RESEND_API_KEY = process.env.RESEND_API_KEY

// Templates de email
function templateReservaEscuela(data: {
  schoolName: string
  studentName: string
  studentEmail: string
  studentPhone: string
  slot: string
  nivel: string
}) {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0ece3;font-family:'DM Sans',Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px">

    <!-- Header -->
    <div style="background:#0e0c0b;border-radius:8px 8px 0 0;padding:24px 32px;text-align:center">
      <div style="font-family:serif;font-size:32px;color:#8b1a1a;margin-bottom:4px">武</div>
      <div style="font-family:serif;font-size:18px;color:#faf8f4;letter-spacing:0.06em">EncuentraTuDojo</div>
    </div>

    <!-- Body -->
    <div style="background:#fff;padding:32px;border-left:1px solid #e8e2d6;border-right:1px solid #e8e2d6">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.14em;color:#c8a96e;margin-bottom:8px">Nueva reserva recibida</div>
      <h1 style="font-family:serif;font-size:26px;font-weight:400;color:#0e0c0b;margin:0 0 8px">
        📅 Clase trial solicitada
      </h1>
      <p style="font-size:14px;color:#7a5c3a;margin:0 0 24px">
        Un alumno reservó una clase trial en <strong>${data.schoolName}</strong> a través de EncuentraTuDojo.
      </p>

      <!-- Datos del alumno -->
      <div style="background:#f0ece3;border-radius:6px;padding:20px;margin-bottom:24px">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.12em;color:#a87c50;margin-bottom:12px">Datos del alumno</div>
        ${[
          ['Nombre', data.studentName],
          ['Email', data.studentEmail],
          ['Teléfono', data.studentPhone || 'No indicó'],
          ['Turno solicitado', data.slot],
          ['Nivel', data.nivel],
        ].map(([label, val]) => `
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e8e2d6;font-size:13px">
          <span style="color:#7a5c3a">${label}</span>
          <span style="color:#0e0c0b;font-weight:500">${val}</span>
        </div>`).join('')}
      </div>

      <div style="background:#faf8f4;border:1px solid #e8e2d6;border-radius:6px;padding:16px;font-size:13px;color:#7a5c3a;line-height:1.6">
        ⚡ <strong style="color:#0e0c0b">Acción requerida:</strong> Contactá al alumno en las próximas 24hs para confirmar el turno. El pago se realiza directamente en el dojo.
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#0e0c0b;border-radius:0 0 8px 8px;padding:20px 32px;text-align:center">
      <div style="font-size:11px;color:rgba(250,248,244,0.3)">
        Este email fue enviado por EncuentraTuDojo · <a href="https://encuentratudojo.vercel.app" style="color:#c8a96e">encuentratudojo.vercel.app</a>
      </div>
    </div>

  </div>
</body>
</html>`
}

function templateReservaAlumno(data: {
  studentName: string
  schoolName: string
  schoolAddress: string
  slot: string
  nivel: string
}) {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0ece3;font-family:'DM Sans',Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px">

    <div style="background:#0e0c0b;border-radius:8px 8px 0 0;padding:24px 32px;text-align:center">
      <div style="font-family:serif;font-size:32px;color:#8b1a1a;margin-bottom:4px">武</div>
      <div style="font-family:serif;font-size:18px;color:#faf8f4;letter-spacing:0.06em">EncuentraTuDojo</div>
    </div>

    <div style="background:#fff;padding:32px;border-left:1px solid #e8e2d6;border-right:1px solid #e8e2d6">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.14em;color:#c8a96e;margin-bottom:8px">Reserva confirmada</div>
      <h1 style="font-family:serif;font-size:26px;font-weight:400;color:#0e0c0b;margin:0 0 8px">
        ¡Tu clase trial fue reservada, ${data.studentName}!
      </h1>
      <p style="font-size:14px;color:#7a5c3a;margin:0 0 24px">
        La escuela recibió tu solicitud y te contactará en las próximas 24hs para confirmar el turno.
      </p>

      <div style="background:#f0ece3;border-radius:6px;padding:20px;margin-bottom:24px">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.12em;color:#a87c50;margin-bottom:12px">Detalles de tu reserva</div>
        ${[
          ['Escuela', data.schoolName],
          ['Turno', data.slot],
          ['Nivel', data.nivel],
          ['Dirección', data.schoolAddress || 'Ver en el perfil de la escuela'],
        ].map(([label, val]) => `
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e8e2d6;font-size:13px">
          <span style="color:#7a5c3a">${label}</span>
          <span style="color:#0e0c0b;font-weight:500">${val}</span>
        </div>`).join('')}
      </div>

      <div style="background:#faf8f4;border:1px solid #e8e2d6;border-radius:6px;padding:16px;font-size:13px;color:#7a5c3a;line-height:1.6">
        💡 <strong style="color:#0e0c0b">Recordá:</strong> El pago de la clase trial se realiza directamente en el dojo el día de la clase.
      </div>
    </div>

    <div style="background:#0e0c0b;border-radius:0 0 8px 8px;padding:20px 32px;text-align:center">
      <div style="font-size:11px;color:rgba(250,248,244,0.3)">
        EncuentraTuDojo · <a href="https://encuentratudojo.vercel.app" style="color:#c8a96e">Ver mi reserva</a>
      </div>
    </div>
  </div>
</body>
</html>`
}

// API Route handler
export async function POST(req: NextRequest) {
  if (!RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY no configurada' }, { status: 500 })
  }

  const body = await req.json()
  const { type, data } = body

  let emails: { to: string; subject: string; html: string }[] = []

  if (type === 'trial_confirmed') {
    // Email a la escuela
    if (data.schoolEmail) {
      emails.push({
        to: data.schoolEmail,
        subject: `📅 Nueva reserva de clase trial — ${data.studentName}`,
        html: templateReservaEscuela(data),
      })
    }
    // Email al alumno
    if (data.studentEmail) {
      emails.push({
        to: data.studentEmail,
        subject: `✅ Tu clase trial en ${data.schoolName} fue reservada`,
        html: templateReservaAlumno(data),
      })
    }
  }

  // Enviar todos los emails via Resend
  const results = await Promise.allSettled(
    emails.map(email =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'EncuentraTuDojo <onboarding@resend.dev>',
          to: email.to,
          subject: email.subject,
          html: email.html,
        }),
      }).then(r => r.json())
    )
  )

  const errors = results.filter(r => r.status === 'rejected')
  if (errors.length > 0) {
    console.error('Email errors:', errors)
  }

  return NextResponse.json({ 
    sent: emails.length - errors.length,
    total: emails.length 
  })
}
