const nodemailer = require('nodemailer');

const TEST_RECIPIENT = 'ductri09876@gmail.com';
let transporter = null;
let warnedMissingConfig = false;

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getMailConfig() {
  const user = String(process.env.SMTP_USER || '').trim();
  // Google thường hiển thị App Password theo nhóm có khoảng trắng.
  const pass = String(process.env.SMTP_PASS || '').replace(/\s/g, '');
  const to = String(process.env.NOTIFICATION_EMAIL || TEST_RECIPIENT).trim();

  if (!user || !pass || !to) {
    if (!warnedMissingConfig) {
      console.warn('[MAIL] Chưa cấu hình SMTP_USER/SMTP_PASS; bỏ qua thông báo email.');
      warnedMissingConfig = true;
    }
    return null;
  }

  return { user, pass, to };
}

function getTransporter(config) {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: config.user, pass: config.pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }
  return transporter;
}

async function sendMail({ subject, text, html, replyTo }) {
  const config = getMailConfig();
  if (!config) return false;

  await getTransporter(config).sendMail({
    from: `Việt Hương Logistics <${config.user}>`,
    to: config.to,
    replyTo: replyTo || undefined,
    subject,
    text,
    html,
  });

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
    html: `
      <h2>Yêu cầu liên hệ mới</h2>
      <p><strong>Mã yêu cầu:</strong> #${safe.id}</p>
      <p><strong>Họ tên:</strong> ${safe.name}</p>
      <p><strong>Điện thoại:</strong> ${safe.phone}</p>
      <p><strong>Email:</strong> ${safe.email}</p>
      <p><strong>Công ty:</strong> ${safe.company}</p>
      <p><strong>Nội dung:</strong><br>${safe.message}</p>
    `,
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
    html: `
      <h2>Câu hỏi mới từ khách hàng</h2>
      <p><strong>Mã câu hỏi:</strong> #${safe.id}</p>
      <p><strong>Họ tên:</strong> ${safe.name}</p>
      <p><strong>Điện thoại:</strong> ${safe.phone}</p>
      <p><strong>Câu hỏi:</strong><br>${safe.question}</p>
    `,
  });
}

module.exports = { sendContactNotification, sendFaqNotification };
