const RESEND_API_URL = 'https://api.resend.com/emails';
const DEFAULT_RECIPIENT = 'ductri09876@gmail.com';
const DEFAULT_FROM = 'Viet Huong Logistics <onboarding@resend.dev>';
const DEFAULT_EMAIL_LOGO_PATH = '/static/email/logofooter.png';

let warnedMissingConfig = false;

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderInfoRows(rows) {
  return rows.map(({ label, value }) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e8edf3;color:#64748b;font-size:13px;width:120px;vertical-align:top;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #e8edf3;color:#172033;font-size:14px;font-weight:600;vertical-align:top;">${value}</td>
    </tr>
  `).join('');
}

function getDefaultEmailLogoUrl() {
  const baseUrl = String(
    process.env.PUBLIC_API_URL
    || process.env.RENDER_EXTERNAL_URL
    || 'https://viethuonglogistics.onrender.com'
  ).trim().replace(/\/+$/, '');

  return baseUrl ? `${baseUrl}${DEFAULT_EMAIL_LOGO_PATH}` : '';
}

function renderEmailTemplate({ eyebrow, title, description, reference, rows, messageLabel, message, action }) {
  const emailLogoUrl = String(process.env.EMAIL_LOGO_URL || getDefaultEmailLogoUrl()).trim();
  const brandMarkup = emailLogoUrl
    ? `<img src="${escapeHtml(emailLogoUrl)}" alt="Viet Huong Logistics" width="170" style="display:block;width:170px;max-width:170px;height:auto;border:0;outline:none;text-decoration:none;">`
    : `
                        <div style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:.2px;">VIỆT HƯƠNG</div>
                        <div style="font-size:10px;color:#cbd5e1;letter-spacing:3px;margin-top:3px;">LOGISTICS</div>
                      `;
  const actionButton = action ? `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;">
      <tr>
        <td bgcolor="#cc1a1a" style="border-radius:8px;">
          <a href="${action.href}" style="display:inline-block;padding:12px 22px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">${action.label}</a>
        </td>
      </tr>
    </table>
  ` : '';

  return `<!doctype html>
  <html lang="vi">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>${title}</title>
    </head>
    <body style="margin:0;padding:0;background:#f2f5f8;font-family:Arial,Helvetica,sans-serif;color:#172033;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${description}</div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f2f5f8;">
        <tr>
          <td align="center" style="padding:28px 12px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 8px 30px rgba(15,23,42,.08);">
              <tr>
                <td style="background:#172033;padding:24px 30px;border-top:5px solid #cc1a1a;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td>
                        ${brandMarkup}
                      </td>
                      <td align="right" style="color:#cbd5e1;font-size:12px;">Mã #${reference}</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:30px;">
                  <div style="display:inline-block;background:#fff1f2;color:#b91c1c;border-radius:999px;padding:6px 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;">${eyebrow}</div>
                  <h1 style="margin:16px 0 8px;font-size:25px;line-height:1.3;color:#172033;">${title}</h1>
                  <p style="margin:0 0 22px;color:#64748b;font-size:14px;line-height:1.6;">${description}</p>

                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    ${renderInfoRows(rows)}
                  </table>

                  <div style="margin-top:24px;background:#f8fafc;border-left:4px solid #cc1a1a;border-radius:6px;padding:18px;">
                    <div style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.7px;margin-bottom:8px;">${messageLabel}</div>
                    <div style="font-size:15px;line-height:1.7;color:#263247;word-break:break-word;">${message}</div>
                  </div>
                  ${actionButton}
                </td>
              </tr>
              <tr>
                <td style="background:#f8fafc;border-top:1px solid #e8edf3;padding:18px 30px;color:#94a3b8;font-size:11px;line-height:1.6;text-align:center;">
                  Email tự động từ hệ thống Việt Hương Logistics<br>
                  <a href="https://viethuonglogistics.com" style="color:#cc1a1a;text-decoration:none;">viethuonglogistics.com</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

function getMailConfig() {
  const apiKey = String(process.env.RESEND_API_KEY || '').trim();
  const to = String(process.env.NOTIFICATION_EMAIL || DEFAULT_RECIPIENT).trim();
  const from = String(process.env.RESEND_FROM_EMAIL || DEFAULT_FROM).trim();

  if (!apiKey || !to || !from) {
    if (!warnedMissingConfig) {
      console.warn('[MAIL] Chưa cấu hình RESEND_API_KEY; bỏ qua thông báo email.');
      warnedMissingConfig = true;
    }
    return null;
  }

  return { apiKey, to, from };
}

async function sendMail({ subject, text, html, replyTo }) {
  const config = getMailConfig();
  if (!config) return false;

  const payload = {
    from: config.from,
    to: [config.to],
    subject,
    text,
    html,
  };

  if (replyTo) payload.reply_to = replyTo;

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend API ${response.status}: ${details}`);
  }

  return true;
}

async function sendContactNotification(contact) {
  const safe = {
    id: escapeHtml(contact.id),
    name: escapeHtml(contact.full_name),
    phone: escapeHtml(contact.phone),
    email: escapeHtml(contact.email || 'Không cung cấp'),
    company: escapeHtml(contact.company || 'Không cung cấp'),
    message: escapeHtml(contact.message).replace(/\n/g, '<br>'),
  };

  return sendMail({
    subject: `[Việt Hương] Yêu cầu liên hệ mới - ${contact.full_name}`,
    replyTo: contact.email,
    text: [
      `Mã yêu cầu: #${contact.id}`,
      `Họ tên: ${contact.full_name}`,
      `Điện thoại: ${contact.phone}`,
      `Email: ${contact.email || 'Không cung cấp'}`,
      `Công ty: ${contact.company || 'Không cung cấp'}`,
      '',
      contact.message,
    ].join('\n'),
    html: renderEmailTemplate({
      eyebrow: 'Liên hệ mới',
      title: 'Bạn vừa nhận được một yêu cầu tư vấn',
      description: 'Khách hàng đã gửi thông tin từ biểu mẫu liên hệ trên website.',
      reference: safe.id,
      rows: [
        { label: 'Họ và tên', value: safe.name },
        { label: 'Điện thoại', value: safe.phone },
        { label: 'Email', value: safe.email },
        { label: 'Công ty', value: safe.company },
      ],
      messageLabel: 'Nội dung yêu cầu',
      message: safe.message,
      action: contact.email ? {
        label: 'Trả lời khách hàng',
        href: `mailto:${encodeURIComponent(contact.email)}?subject=${encodeURIComponent(`Phản hồi từ Việt Hương Logistics - yêu cầu #${contact.id}`)}`,
      } : null,
    }),
  });
}

async function sendFaqNotification(inquiry) {
  const safe = {
    id: escapeHtml(inquiry.id),
    name: escapeHtml(inquiry.name),
    phone: escapeHtml(inquiry.phone),
    question: escapeHtml(inquiry.question).replace(/\n/g, '<br>'),
  };

  return sendMail({
    subject: `[Việt Hương] Câu hỏi mới - ${inquiry.name}`,
    text: [
      `Mã câu hỏi: #${inquiry.id}`,
      `Họ tên: ${inquiry.name}`,
      `Điện thoại: ${inquiry.phone}`,
      '',
      inquiry.question,
    ].join('\n'),
    html: renderEmailTemplate({
      eyebrow: 'Câu hỏi mới',
      title: 'Khách hàng cần được giải đáp',
      description: 'Một câu hỏi mới vừa được gửi từ trang giải đáp trên website.',
      reference: safe.id,
      rows: [
        { label: 'Họ và tên', value: safe.name },
        { label: 'Điện thoại', value: safe.phone },
      ],
      messageLabel: 'Câu hỏi của khách hàng',
      message: safe.question,
      action: {
        label: 'Gọi cho khách hàng',
        href: `tel:${encodeURIComponent(inquiry.phone)}`,
      },
    }),
  });
}

module.exports = { sendContactNotification, sendFaqNotification };
