import { useCallback, useEffect, useState } from 'react'
import './App.css'

const emptyForm = { fullName: '', email: '', phone: '' }

function validateForm(form) {
  const errors = {}
  if (!form.fullName.trim()) errors.fullName = 'Enter your full name.'
  if (!form.email.trim()) errors.email = 'Enter your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }
  if (!form.phone.trim()) errors.phone = 'Enter your phone number.'
  return errors
}

async function readResponse(response) {
  try {
    return await response.json()
  } catch {
    return {}
  }
}

async function fetchUsers() {
  const response = await fetch('/api/users')
  const result = await readResponse(response)
  if (!response.ok) throw new Error(result.message || 'Could not load users.')
  return result.users ?? []
}

function App() {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [notice, setNotice] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const loadUsers = useCallback(async () => {
    try {
      const nextUsers = await fetchUsers()
      setUsers(nextUsers)
    } catch {
      setNotice({ type: 'error', text: 'Could not load users. Check that the API and database are running.' })
    } finally {
      setIsLoading(false)
    }
  }, [])

  function refreshUsers() {
    setIsLoading(true)
    setNotice(null)
    loadUsers()
  }

  useEffect(() => {
    let isActive = true

    async function loadInitialUsers() {
      try {
        const initialUsers = await fetchUsers()
        if (isActive) setUsers(initialUsers)
      } catch {
        if (isActive) setNotice({ type: 'error', text: 'Could not load users. Check that the API and database are running.' })
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadInitialUsers()
    return () => { isActive = false }
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => ({ ...current, [name]: '' }))
    setNotice(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
    setFieldErrors({})
    setNotice(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const errors = validateForm(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length) return

    setIsSaving(true)
    setNotice(null)
    const isEditing = Boolean(editingId)

    try {
      const response = await fetch(isEditing ? `/api/users/${editingId}` : '/api/users', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const result = await readResponse(response)
      if (!response.ok) {
        setFieldErrors(result.errors ?? {})
        setNotice({ type: 'error', text: result.message || 'Could not save this user.' })
        return
      }

      setForm(emptyForm)
      setEditingId(null)
      setFieldErrors({})
      setNotice({ type: 'success', text: result.message })
      await loadUsers()
    } catch {
      setNotice({ type: 'error', text: 'Could not connect to the server. Your changes were not saved.' })
    } finally {
      setIsSaving(false)
    }
  }

  function startEditing(user) {
    setEditingId(user.id)
    setForm({ fullName: user.fullName, email: user.email, phone: user.phone })
    setFieldErrors({})
    setNotice(null)
    document.getElementById('fullName')?.focus()
  }

  async function deleteUser(user) {
    if (!window.confirm(`Delete ${user.fullName}? This cannot be undone.`)) return

    setDeletingId(user.id)
    setNotice(null)
    try {
      const response = await fetch(`/api/users/${user.id}`, { method: 'DELETE' })
      const result = await readResponse(response)
      if (!response.ok) throw new Error(result.message || 'Could not delete this user.')
      if (editingId === user.id) cancelEdit()
      setNotice({ type: 'success', text: result.message })
      await loadUsers()
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'Could not connect to the server.' })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <a className="brand" href="#top" aria-label="Clearview home">
          <span className="brand-mark" aria-hidden="true">C</span>
          <span>Clearview</span>
        </a>
        <span className="header-caption">USER MANAGEMENT</span>
      </header>

      <section className="page-heading" id="top">
        <p className="eyebrow">DIRECTORY</p>
        <h1>User management</h1>
        <p className="intro">Create, view, update, and remove user records.</p>
      </section>

      {notice && (
        <p className={`notice notice-${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>
          {notice.text}
        </p>
      )}

      <div className="content-grid">
        <section className="panel form-panel" aria-labelledby="form-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{editingId ? 'UPDATE DETAILS' : 'NEW RECORD'}</p>
              <h2 id="form-title">{editingId ? 'Edit user' : 'Add a user'}</h2>
            </div>
            <span className="panel-icon" aria-hidden="true">{editingId ? '✎' : '+'}</span>
          </div>

          <form className="registration-form" onSubmit={handleSubmit} noValidate>
            <div className="field-group">
              <label htmlFor="fullName">Full name</label>
              <input id="fullName" name="fullName" type="text" autoComplete="name" placeholder="e.g. Alex Morgan" value={form.fullName} onChange={handleChange} aria-invalid={Boolean(fieldErrors.fullName)} aria-describedby={fieldErrors.fullName ? 'fullName-error' : undefined} required />
              {fieldErrors.fullName && <span className="field-error" id="fullName-error">{fieldErrors.fullName}</span>}
            </div>

            <div className="field-group">
              <label htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={handleChange} aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'email-error' : undefined} required />
              {fieldErrors.email && <span className="field-error" id="email-error">{fieldErrors.email}</span>}
            </div>

            <div className="field-group">
              <label htmlFor="phone">Phone number</label>
              <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="e.g. +1 555 123 4567" value={form.phone} onChange={handleChange} aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? 'phone-error' : undefined} required />
              {fieldErrors.phone && <span className="field-error" id="phone-error">{fieldErrors.phone}</span>}
            </div>

            <button className="submit-button" type="submit" disabled={isSaving}>
              {isSaving ? 'Saving…' : editingId ? 'Save changes' : 'Add user'}
              {!isSaving && <span aria-hidden="true">→</span>}
            </button>
            {editingId && <button className="cancel-button" type="button" onClick={cancelEdit}>Cancel editing</button>}
          </form>
          <p className="card-note">Email addresses must be unique.</p>
        </section>

        <section className="panel directory-panel" aria-labelledby="directory-title">
          <div className="panel-heading directory-heading">
            <div>
              <p className="eyebrow">RECORDS</p>
              <h2 id="directory-title">Users <span className="user-count">{users.length}</span></h2>
            </div>
            <button className="refresh-button" type="button" onClick={refreshUsers} disabled={isLoading} aria-label="Refresh users">↻</button>
          </div>

          {isLoading ? (
            <p className="empty-state">Loading users…</p>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon" aria-hidden="true">◎</span>
              <strong>No users yet</strong>
              <span>Add a user with the form to get started.</span>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th scope="col">Name</th><th scope="col">Email</th><th scope="col">Phone</th><th scope="col"><span className="sr-only">Actions</span></th></tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td data-label="Name"><span className="user-name">{user.fullName}</span></td>
                      <td data-label="Email">{user.email}</td>
                      <td data-label="Phone">{user.phone}</td>
                      <td className="actions-cell" data-label="Actions">
                        <button className="row-action" type="button" onClick={() => startEditing(user)} aria-label={`Edit ${user.fullName}`}>Edit</button>
                        <button className="row-action delete-action" type="button" onClick={() => deleteUser(user)} disabled={deletingId === user.id} aria-label={`Delete ${user.fullName}`}>
                          {deletingId === user.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <footer className="page-footer">Clearview · User directory</footer>
    </main>
  )
}

export default App
