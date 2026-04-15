// Contact Controller — Manages visitor inquiries and admin message management.
// Handles automatic email notifications, pagination, and bulk cleanup operations.
const mongoose = require('mongoose')
const Contact  = require('../models/Contact')
const sendMail = require('../config/mailer')
const { confirmationEmail, notificationEmail } = require('../utils/emailTemplates')

function parseBrowser(ua = '') {
  if (ua.includes('Edg/'))     return `Edge ${(ua.match(/Edg\/([\d.]+)/) || [])[1] || ''}`
  if (ua.includes('Chrome/'))  return `Chrome ${(ua.match(/Chrome\/([\d.]+)/) || [])[1] || ''}`
  if (ua.includes('Firefox/')) return `Firefox ${(ua.match(/Firefox\/([\d.]+)/) || [])[1] || ''}`
  if (ua.includes('Safari/') && !ua.includes('Chrome')) return `Safari ${(ua.match(/Version\/([\d.]+)/) || [])[1] || ''}`
  if (ua.includes('OPR/'))     return `Opera ${(ua.match(/OPR\/([\d.]+)/) || [])[1] || ''}`
  return 'Unknown'
}

exports.submit = async (req, res) => {
  try {
    const { name, email, message } = req.body

    const ip        = req.ip
    const userAgent = (req.headers['user-agent'] || '').slice(0, 500)
    const browser   = parseBrowser(userAgent)
    const device    = /mobile|android|iphone|ipad/i.test(userAgent) ? 'Mobile' : 'Desktop'

    await Contact.create({ name, email, message, ip, userAgent, browser, device })

    try {
      await sendMail({ to: email, subject: '✓ Got your message — Lokesh Sain', html: confirmationEmail(name) })
    } catch (e) { console.error('[Contact] Confirmation email failed:', e.message) }

    try {
      const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'medium' })
      await sendMail({
        to:      process.env.OWNER_EMAIL,
        subject: `📬 New message from ${name}`,
        html:    notificationEmail({ name, email, message, ip, userAgent, browser, device, dateStr }),
      })
    } catch (e) { console.error('[Contact] Admin notification failed:', e.message) }

    res.status(201).json({ message: 'Message sent successfully' })
  } catch (err) {
    console.error('[Contact]', err.message)
    res.status(500).json({ message: 'Failed to send message — please try again' })
  }
}

// Fix M-02 + #21: Paginated contacts
exports.getContacts = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1)
    const limit = Math.min(50, parseInt(req.query.limit) || 20)
    const skip  = (page - 1) * limit

    const [contacts, total] = await Promise.all([
      Contact.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Contact.countDocuments(),
    ])

    res.json({
      contacts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve contacts' })
  }
}

// Fix M-02: Mark single contact as read
exports.markRead = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: 'Invalid contact ID' })
    const contact = await Contact.findByIdAndUpdate(id, { read: true }, { new: true })
    if (!contact) return res.status(404).json({ message: 'Contact not found' })
    res.json({ message: 'Marked as read', contact })
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark as read' })
  }
}

// Fix NM-02: Delete a single contact message
exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: 'Invalid contact ID' })
    const result = await Contact.findByIdAndDelete(id)
    if (!result) return res.status(404).json({ message: 'Contact not found' })
    res.json({ message: 'Message deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' })
  }
}

// Fix NM-02: Bulk delete all read messages
exports.deleteAllRead = async (req, res) => {
  try {
    const result = await Contact.deleteMany({ read: true })
    res.json({ message: `Deleted ${result.deletedCount} read message(s)` })
  } catch (err) {
    res.status(500).json({ message: 'Bulk delete failed' })
  }
}
