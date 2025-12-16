document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('changePasswordForm')
  if (!form) return
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const current = document.getElementById('current_password')?.value || ''
    const next = document.getElementById('new_password')?.value || ''
    const confirm = document.getElementById('confirm_password')?.value || ''
    if (!current || !next || !confirm) {
      alert('All fields are required.')
      return
    }
    if (next.length < 8) {
      alert('New password must be at least 8 characters.')
      return
    }
    if (next !== confirm) {
      alert('New passwords do not match.')
      return
    }
    alert('Password change handling is not yet wired to backend.')
  })
})
