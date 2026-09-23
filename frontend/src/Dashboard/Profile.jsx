import { useEffect, useState } from 'react'
import api, { getError } from '../lib/api'
import { saveSession, getUser } from '../lib/auth'
import { Spinner, Toast } from '../components/UI'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons'

const AVAILABLE_SKILLS = [
  'Software Engineering',
  'Computer Science',
  'Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'JEE',
  'NEET',
  'React.js',
  'Node.js',
  'Java',
  'JavaScript',
  'TypeScript',
  'Python',
  'Next.js',
  'Express.js',
  'SQL',
  'MongoDB',
  'Docker',
  'Git',
  'C++',
  'DSA',
  'Cyber Security',
  'Machine Learning',
  'Artificial Intelligence'
]

export default function Profile() {
  const cachedUser = getUser()

  const [formData, setFormData] = useState({
    name: cachedUser?.name || '',
    skills: cachedUser?.skills || [],
    role: cachedUser?.role || 'learner'
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [skillSearch, setSkillSearch] = useState('')
  const [customSkill, setCustomSkill] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get('/auth/profile')

        setFormData({
          name: data.name || '',
          skills: Array.isArray(data.skills) ? data.skills : [],
          role: data.role || 'learner'
        })
      } catch (error) {
        setToastMessage(getError(error))
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleToggleSkill = (skillName) => {
    setFormData((prev) => {
      const isSelected = prev.skills.includes(skillName)

      return {
        ...prev,
        skills: isSelected
          ? prev.skills.filter((item) => item !== skillName)
          : [...prev.skills, skillName]
      }
    })
  }

  const handleAddCustomSkill = () => {
    const skill = customSkill.trim()

    if (!skill) return

    const exists = formData.skills.some(
      (item) => item.toLowerCase() === skill.toLowerCase()
    )

    if (!exists) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill]
      }))
    }

    setCustomSkill('')
  }

  const handleRemoveSkill = (skillName) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillName)
    }))
  }

  const handleRoleChange = (role) => {
    setFormData((prev) => ({
      ...prev,
      role
    }))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()

    setIsSaving(true)

    try {
      const { data } = await api.put('/auth/profile', {
        name: formData.name.trim(),
        skills: formData.skills,
        role: formData.role
      })

      const updatedUser = data.user

      saveSession({
        ...cachedUser,
        ...updatedUser,
        token: localStorage.getItem('dailygram_token'),
        userid: cachedUser?.userid
      })

      setFormData({
        name: updatedUser.name || '',
        skills: Array.isArray(updatedUser.skills)
          ? updatedUser.skills
          : [],
        role: updatedUser.role || 'learner'
      })

      setToastMessage('Profile updated successfully.')
    } catch (error) {
      setToastMessage(getError(error))
    } finally {
      setIsSaving(false)
    }
  }

  const filteredSkills = AVAILABLE_SKILLS.filter((skill) =>
    skill.toLowerCase().includes(skillSearch.toLowerCase())
  )

  const firstInitial = (formData.name || 'U')[0].toUpperCase()

  const isSuccessNotification =
    toastMessage.toLowerCase().includes('successfully')

  return (
    <div className="space-y-8">
      <header>
        <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase block mb-1">
          ACCOUNT
        </span>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Your profile
        </h1>

        <p className="text-slate-500 mt-1 text-sm leading-relaxed">
          Manage your name, role and skills.
        </p>
      </header>

      {isLoading ? (
        <div className="flex items-center gap-3 justify-center text-slate-500 py-16 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <Spinner />
          <span className="text-sm font-medium">
            Loading profile…
          </span>
        </div>
      ) : (
        <form
          className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 max-w-2xl space-y-6 shadow-sm"
          onSubmit={handleSaveProfile}
        >
          {/* PROFILE HEADER */}
          <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
            <div
              className="w-14 h-14 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-lg font-black flex items-center justify-center"
              aria-hidden="true"
            >
              {firstInitial}
            </div>

            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900 leading-tight truncate">
                {formData.name || 'Your name'}
              </h2>

              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 mt-1 block">
                {formData.role}
              </span>
            </div>
          </div>

          {/* NAME */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="fullName"
              className="text-xs font-bold text-slate-500 uppercase tracking-wide"
            >
              Full name
            </label>

            <input
              id="fullName"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name: e.target.value
                }))
              }
              required
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 transition-all bg-white text-slate-900"
            />
          </div>

          {/* EMAIL */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="emailAddress"
              className="text-xs font-bold text-slate-500 uppercase tracking-wide"
            >
              Email address
            </label>

            <input
              id="emailAddress"
              value={cachedUser?.email || ''}
              disabled
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-400 bg-slate-50 cursor-not-allowed outline-none select-none"
            />
          </div>

          {/* ROLE SWITCH */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Account role
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleChange('learner')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  formData.role === 'learner'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-sm">
                  🎓 Learner
                </div>

                <div className="text-xs mt-1 opacity-70">
                  Learn from mentors and improve your skills.
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('mentor')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  formData.role === 'mentor'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-sm">
                  👨‍🏫 Mentor
                </div>

                <div className="text-xs mt-1 opacity-70">
                  Guide learners and share your knowledge.
                </div>
              </button>
            </div>
          </div>

          {/* SELECTED SKILLS */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Your skills
            </span>

            {formData.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    title="Remove skill"
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-all"
                  >
                    {skill} ×
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                No skills selected yet.
              </p>
            )}
          </div>

          {/* SEARCH SKILLS */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="skillSearch"
              className="text-xs font-bold text-slate-500 uppercase tracking-wide"
            >
              Find skills
            </label>

            <input
              id="skillSearch"
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              placeholder="Search skills..."
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 transition-all"
            />

            <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto">
              {filteredSkills.map((skill) => {
                const isSelected = formData.skills.includes(skill)

                return (
                  <button
                    type="button"
                    key={skill}
                    onClick={() => handleToggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-600 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {skill}
                  </button>
                )
              })}
            </div>
          </div>

          {/* CUSTOM SKILL */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="customSkill"
              className="text-xs font-bold text-slate-500 uppercase tracking-wide"
            >
              Add custom skill
            </label>

            <div className="flex gap-2">
              <input
                id="customSkill"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddCustomSkill()
                  }
                }}
                placeholder="e.g. UI/UX Design"
                className="flex-1 min-w-0 px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 transition-all"
              />

              <button
                type="button"
                onClick={handleAddCustomSkill}
                className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* SAVE */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-semibold transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2 h-10"
          >
            {isSaving ? (
              <>
                <Spinner />
                <span>Saving changes…</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faFloppyDisk} />
                <span>Save changes</span>
              </>
            )}
          </button>
        </form>
      )}

      <Toast
        message={toastMessage}
        type={isSuccessNotification ? 'success' : 'error'}
        onClose={() => setToastMessage('')}
      />
    </div>
  )
}