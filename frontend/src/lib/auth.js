export const getUser = () => {
  try { return JSON.parse(localStorage.getItem('dailygram_user') || 'null') } catch { return null }
}
export const getToken = () => localStorage.getItem('dailygram_token')
export const saveSession = data => {
  if (data?.token) localStorage.setItem('dailygram_token', data.token)
  const user = { userid: data?.userid, name: data?.name, email: data?.email, role: data?.role, skills: data?.skills || [] }
  localStorage.setItem('dailygram_user', JSON.stringify(user))
  return user
}
export const clearSession = () => {
  localStorage.removeItem('dailygram_token')
  localStorage.removeItem('dailygram_user')
}


/*



*/