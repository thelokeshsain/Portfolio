import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  User,
  Mail,
  Clock,
  Monitor,
  Wifi,
  CheckCheck,
  Trash2,
  ArrowLeft,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useConfirm } from '../ui/ConfirmDialog'
import { Card, FL, DelBtn } from './AdminHelpers'
import { apiClient } from '../../context/AuthContext'

export default function ContactsViewer() {
  const { confirm, Dialog } = useConfirm()
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })

  const fetchContacts = async (p = 1) => {
    setLoading(true)
    try {
      const r = await apiClient.get(`/admin/contacts?page=${p}&limit=10`)
      setContacts(r.data.contacts || [])
      setPagination(r.data.pagination || { total: 0, pages: 1 })
    } catch {
      toast.error("Failed to load messages")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const r = await apiClient.get("/admin/contacts?page=1&limit=10")
        if (!mounted) return
        setContacts(r.data.contacts || [])
        setPagination(r.data.pagination || { total: 0, pages: 1 })
      } catch {
        if (mounted) toast.error("Failed to load messages")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const fmt = (iso) => {
    try {
      return new Date(iso).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    } catch {
      return iso || "—"
    }
  }

  const markRead = async (id) => {
    try {
      await apiClient.put(`/admin/contacts/${id}/read`)
      setContacts((cs) =>
        cs.map((c) => (c._id === id ? { ...c, read: true } : c)),
      )
      if (selected?._id === id) setSelected((s) => ({ ...s, read: true }))
    } catch {
      toast.error("Failed to mark as read")
    }
  }

  const deleteContact = async (id) => {
    const ok = await confirm("Delete this message? This cannot be undone.")
    if (!ok) return
    try {
      await apiClient.delete(`/admin/contacts/${id}`)
      setContacts((cs) => cs.filter((c) => c._id !== id))
      if (selected?._id === id) setSelected(null)
      toast.success("Message deleted")
    } catch {
      toast.error("Delete failed")
    }
  }

  const deleteAllRead = async () => {
    const readCount = contacts.filter((c) => c.read).length
    if (!readCount) {
      toast("No read messages to delete")
      return
    }
    const ok = await confirm(
      `Delete all ${readCount} read message(s)? This cannot be undone.`,
    )
    if (!ok) return
    try {
      const r = await apiClient.delete("/admin/contacts")
      toast.success(r.data.message)
      fetchContacts(1)
      setPage(1)
    } catch {
      toast.error("Bulk delete failed")
    }
  }

  if (selected) {
    return (
      <div>
        {Dialog}
        <button
          onClick={() => setSelected(null)}
          className="btn btn-outline btn-sm"
          style={{ marginBottom: 20 }}
        >
          <ArrowLeft size={14} /> Back to Messages
        </button>
        <Card>
          <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
            <div className="mac-dot" style={{ background: "#ff5f57" }} />
            <div className="mac-dot" style={{ background: "#febc2e" }} />
            <div className="mac-dot" style={{ background: "#28c840" }} />
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: 11,
                color: "var(--muted)",
                marginLeft: 8,
              }}
            >
              message.details
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              gap: 12,
              marginBottom: 20,
            }}
          >
            {[
              { Icon: User, label: "From", val: selected.name },
              { Icon: Mail, label: "Email", val: selected.email },
              { Icon: Clock, label: "Received", val: fmt(selected.createdAt) },
              { Icon: Monitor, label: "Device", val: selected.device || "—" },
              { Icon: Wifi, label: "IP", val: selected.ip || "—" },
            ].map(({ Icon: ItemIcon, label, val }) => ( // eslint-disable-line no-unused-vars
              <div
                key={label}
                style={{
                  border: "2px solid var(--ink)",
                  borderRadius: "var(--r)",
                  padding: "12px 14px",
                  background: "var(--cream)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 4,
                  }}
                >
                  <ItemIcon size={12} style={{ color: "var(--muted)" }} />
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--muted)",
                    }}
                  >
                    {label}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--ink)",
                    wordBreak: "break-all",
                  }}
                >
                  {val}
                </div>
              </div>
            ))}
          </div>
          <FL>Message</FL>
          <div
            style={{
              border: "2px solid var(--ink)",
              borderRadius: "var(--r)",
              padding: "16px 18px",
              background: "var(--paper)",
              fontSize: 15,
              lineHeight: 1.8,
              color: "var(--ink)",
              whiteSpace: "pre-wrap",
              marginBottom: 20,
              minHeight: 80,
            }}
          >
            {selected.message}
          </div>
          {selected.browser && (
            <div
              style={{
                fontSize: 12,
                color: "var(--muted)",
                fontFamily: "var(--mono)",
                marginBottom: 20,
              }}
            >
              Browser: {selected.browser}
            </div>
          )}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a
              href={`mailto:${selected.email}?subject=Re: Your message&body=Hi ${selected.name},`}
              className="btn btn-yellow"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Mail size={14} /> Reply to {selected.name}
            </a>
            {!selected.read && (
              <button
                onClick={() => markRead(selected._id)}
                className="btn btn-outline btn-sm"
              >
                <CheckCheck size={14} /> Mark as Read
              </button>
            )}
            <button
              onClick={() => deleteContact(selected._id)}
              className="btn btn-outline btn-sm"
              style={{ color: "#cc0000", borderColor: "#cc0000" }}
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      {Dialog}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h2
          style={{
            fontWeight: 900,
            fontSize: "clamp(20px,3vw,26px)",
            letterSpacing: "-0.03em",
          }}
        >
          Messages
          {pagination.total > 0 && (
            <span
              style={{
                fontWeight: 400,
                fontSize: 16,
                color: "var(--muted)",
                marginLeft: 12,
              }}
            >
              ({pagination.total} total)
            </span>
          )}
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => fetchContacts(page)}
            className="btn btn-outline btn-sm"
          >
            Refresh
          </button>
          <button
            onClick={deleteAllRead}
            className="btn btn-outline btn-sm"
            style={{ color: "#cc0000", borderColor: "#cc0000" }}
          >
            <Trash2 size={13} /> Delete Read
          </button>
        </div>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "var(--muted)",
            fontFamily: "var(--mono)",
          }}
        >
          Loading messages…
        </div>
      ) : contacts.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <MessageSquare
            size={32}
            style={{ color: "var(--muted)", margin: "0 auto 12px" }}
          />
          <div
            style={{
              color: "var(--muted)",
              fontFamily: "var(--mono)",
              fontSize: 14,
            }}
          >
            No messages yet
          </div>
        </Card>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 20,
            }}
          >
            {contacts.map((c, i) => (
              <div
                key={c._id || i}
                onClick={() => setSelected(c)}
                style={{
                  border: "2px solid var(--ink)",
                  borderRadius: "var(--r)",
                  padding: "16px 20px",
                  background: c.read ? "var(--surface)" : "var(--cream)",
                  boxShadow: "var(--sh)",
                  cursor: "pointer",
                  transition: "transform .15s, box-shadow .15s",
                  display: "flex",
                  gap: 16,
                  alignItems: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translate(-2px,-2px)"
                  e.currentTarget.style.boxShadow = "var(--sh-lg)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none"
                  e.currentTarget.style.boxShadow = "var(--sh)"
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    background: c.read ? "var(--muted)" : "var(--yellow)",
                    border: "2px solid var(--ink)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: 16,
                    color: "#000",
                    flexShrink: 0,
                  }}
                >
                  {c.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: c.read ? 600 : 800,
                        fontSize: 15,
                        color: "var(--ink)",
                      }}
                    >
                      {c.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--muted)",
                        fontFamily: "var(--mono)",
                        flexShrink: 0,
                      }}
                    >
                      {fmt(c.createdAt)}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--muted)",
                      marginTop: 2,
                    }}
                  >
                    {c.email}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--subtle)",
                      marginTop: 4,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.message}
                  </div>
                </div>
                {!c.read && (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--yellow)",
                      border: "2px solid var(--ink)",
                      flexShrink: 0,
                    }}
                    title="Unread"
                  />
                )}
                <ChevronRight
                  size={16}
                  style={{ color: "var(--muted)", flexShrink: 0 }}
                />
              </div>
            ))}
          </div>
          {pagination.pages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 10,
                alignItems: "center",
              }}
            >
              <button
                onClick={() => {
                  const p = Math.max(1, page - 1)
                  setPage(p)
                  fetchContacts(p)
                }}
                disabled={page <= 1}
                className="btn btn-outline btn-sm"
                style={{ opacity: page <= 1 ? 0.4 : 1 }}
              >
                <ChevronLeft size={14} />
              </button>
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 13,
                  color: "var(--muted)",
                }}
              >
                {page} / {pagination.pages}
              </span>
              <button
                onClick={() => {
                  const p = Math.min(pagination.pages, page + 1)
                  setPage(p)
                  fetchContacts(p)
                }}
                disabled={page >= pagination.pages}
                className="btn btn-outline btn-sm"
                style={{ opacity: page >= pagination.pages ? 0.4 : 1 }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
