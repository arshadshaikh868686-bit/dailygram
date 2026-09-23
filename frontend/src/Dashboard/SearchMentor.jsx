import { useEffect, useState, useCallback } from 'react';
import api, { getError } from '../lib/api';
import { getUser } from '../lib/auth';
import { Spinner, Empty, Toast } from '../components/UI';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
  faCalendarCheck,
  faCode,
  faServer,
  faCubes,
  faTerminal,
  faLayerGroup,
  faDatabase,
  faBoxOpen,
  faCodeBranch,
  faFlask,
  faBook,
  faGraduationCap,
  faLaptopCode
} from '@fortawesome/free-solid-svg-icons';


// Popular skills shown as quick filters
const POPULAR_SKILLS = [
  { name: 'Software Engineering', icon: faLaptopCode },
  { name: 'Computer Science', icon: faLaptopCode },
  { name: 'Science', icon: faFlask },
  { name: 'Mathematics', icon: faBook },
  { name: 'Physics', icon: faFlask },
  { name: 'Chemistry', icon: faFlask },
  { name: 'Biology', icon: faFlask },
  { name: 'JEE', icon: faGraduationCap },
  { name: 'NEET', icon: faGraduationCap },
  { name: 'React.js', icon: faCode },
  { name: 'Node.js', icon: faServer },
  { name: 'Java', icon: faCubes },
  { name: 'JavaScript', icon: faTerminal },
  { name: 'TypeScript', icon: faTerminal },
  { name: 'Python', icon: faTerminal },
  { name: 'Next.js', icon: faLayerGroup },
  { name: 'Express.js', icon: faServer },
  { name: 'SQL', icon: faDatabase },
  { name: 'MongoDB', icon: faDatabase },
  { name: 'Docker', icon: faBoxOpen },
  { name: 'Git', icon: faCodeBranch },
  { name: 'C++', icon: faCode },
  { name: 'DSA', icon: faCode },
  { name: 'Cyber Security', icon: faLaptopCode },
  { name: 'Machine Learning', icon: faLaptopCode },
  { name: 'Artificial Intelligence', icon: faLaptopCode }
];


export default function SearchMentor() {
  const user = getUser();

  const isMentorAccount = user?.role === 'mentor';

  const [selectedSkill, setSelectedSkill] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [mentorsList, setMentorsList] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState('');

  const [toastMessage, setToastMessage] = useState('');


  // Search mentors from backend
  const handleSearchMentors = useCallback(
    async (skill = selectedSkill) => {
      const searchSkill = skill.trim();

      setIsLoading(true);
      setToastMessage('');

      try {
        const { data } = await api.get('/user/mentors', {
          params: searchSkill
            ? { skills: searchSkill }
            : {}
        });

        setMentorsList(Array.isArray(data) ? data : []);

      } catch (error) {
        setMentorsList([]);
        setToastMessage(getError(error));

      } finally {
        setIsLoading(false);
      }
    },
    [selectedSkill]
  );


  // Initial load
  useEffect(() => {
    handleSearchMentors('');
  }, [handleSearchMentors]);


  // Search form submit
  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const skill = searchInput.trim();

    setSelectedSkill(skill);

    handleSearchMentors(skill);
  };


  // Quick skill button
  const handleSkillSelect = (skill) => {
    setSelectedSkill(skill);
    setSearchInput(skill);

    handleSearchMentors(skill);
  };


  // Clear search
  const handleClearSearch = () => {
    setSearchInput('');
    setSelectedSkill('');

    handleSearchMentors('');
  };


  // Book mentor session
  const handleBookSession = async (mentor) => {
    if (isMentorAccount) {
      setToastMessage('Mentor accounts cannot request mentor sessions.');
      return;
    }

    const skillToBook = selectedSkill.trim();

    if (!skillToBook) {
      setToastMessage('Please select or search for a skill first.');
      return;
    }

    setActiveBookingId(mentor._id);

    try {
      await api.post('/appointments/request', {
        mentorId: mentor._id,
        skill: skillToBook
      });

      setToastMessage(`Request sent to ${mentor.name}.`);

    } catch (error) {
      setToastMessage(getError(error));

    } finally {
      setActiveBookingId('');
    }
  };


  const isSuccessNotification =
    toastMessage.startsWith('Request');


  return (
    <div className="space-y-8">

      {/* Header */}
      <header>
        <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase block mb-1">
          MENTOR DIRECTORY
        </span>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Find a mentor
        </h1>

        <p className="text-slate-500 mt-1 text-sm leading-relaxed">
          Search any skill or topic and discover mentors ready to help.
        </p>
      </header>


      {/* Search Bar */}
      <section>
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col sm:flex-row gap-3"
        >

          <div className="relative flex-1">

            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(event.target.value)
              }
              placeholder="Search skill or topic... e.g. Python, JEE, Physics"
              className="w-full h-12 rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

          </div>


          <button
            type="submit"
            disabled={isLoading}
            className="h-12 px-6 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>


          {selectedSkill && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="h-12 px-5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Clear
            </button>
          )}

        </form>


        {/* Current search */}
        {selectedSkill && (
          <div className="mt-3 text-sm text-slate-500">
            Showing mentors for:
            <span className="font-semibold text-indigo-600 ml-1">
              {selectedSkill}
            </span>
          </div>
        )}
      </section>


      {/* Popular Skills */}
      <nav
        aria-label="Popular Skills"
        className="border-b border-slate-200 pb-3"
      >

        <div className="mb-3">
          <h2 className="text-sm font-bold text-slate-800">
            Popular skills
          </h2>
        </div>


        <div
          className="flex gap-2 overflow-x-auto pb-1"
          role="tablist"
        >

          {POPULAR_SKILLS.map((skillItem) => {

            const isTabActive =
              selectedSkill.toLowerCase() ===
              skillItem.name.toLowerCase();

            return (
              <button
                key={skillItem.name}
                type="button"
                role="tab"
                aria-selected={isTabActive}
                onClick={() =>
                  handleSkillSelect(skillItem.name)
                }
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
                  isTabActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >

                <FontAwesomeIcon
                  icon={skillItem.icon}
                  className="text-sm"
                />

                <span>
                  {skillItem.name}
                </span>

              </button>
            );
          })}

        </div>
      </nav>


      {/* Results */}
      <main className="w-full">

        {isLoading ? (

          <div className="flex items-center gap-3 justify-center text-slate-500 py-16 bg-white border border-slate-200 rounded-2xl shadow-xs">

            <Spinner />

            <span className="text-sm font-medium">
              Searching mentors…
            </span>

          </div>

        ) : mentorsList.length ? (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

            {mentorsList.map((mentorItem) => {

              const isCurrentlyBookingThis =
                activeBookingId === mentorItem._id;


              return (
                <article
                  key={mentorItem._id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between gap-4 transition-all hover:border-slate-300"
                >

                  {/* Mentor info */}
                  <div className="flex gap-3 items-start">

                    <div
                      className="w-11 h-11 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden select-none"
                      aria-hidden="true"
                    >
                      <span className="text-lg font-bold text-indigo-600">
                        {mentorItem.name?.charAt(0)?.toUpperCase() || 'M'}
                      </span>
                    </div>


                    <div className="min-w-0">

                      <h3 className="font-bold text-slate-900 truncate">
                        {mentorItem.name}
                      </h3>

                      <p className="text-xs text-slate-500 mt-1">
                        Mentor
                      </p>

                    </div>

                  </div>


                  {/* Skills */}
                  <div>

                    <p className="text-xs font-semibold text-slate-500 mb-2">
                      Skills
                    </p>

                    <div className="flex flex-wrap gap-2">

                      {Array.isArray(mentorItem.skills) &&
                      mentorItem.skills.length ? (

                        mentorItem.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs"
                          >
                            {skill}
                          </span>
                        ))

                      ) : (

                        <span className="text-xs text-slate-400">
                          No skills added
                        </span>

                      )}

                    </div>

                  </div>


                  {/* Action */}
                  <button
                    type="button"
                    disabled={
                      isCurrentlyBookingThis ||
                      isMentorAccount
                    }
                    onClick={() =>
                      handleBookSession(mentorItem)
                    }
                    className="w-full min-h-11 rounded-xl bg-indigo-600 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >

                    {isCurrentlyBookingThis ? (

                      <Spinner />

                    ) : isMentorAccount ? (

                      <span>
                        Learners only
                      </span>

                    ) : (

                      <>
                        <FontAwesomeIcon
                          icon={faCalendarCheck}
                        />

                        <span>
                          Request session
                        </span>
                      </>

                    )}

                  </button>

                </article>
              );

            })}

          </div>

        ) : (

          <div className="bg-white border border-slate-200 rounded-2xl py-16 px-6">

            <Empty />

            <div className="text-center mt-3">

              <h3 className="font-bold text-slate-800">
                No mentors found
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Try another skill or topic.
              </p>

            </div>

          </div>

        )}

      </main>


      {/* Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={isSuccessNotification ? 'success' : 'error'}
          onClose={() => setToastMessage('')}
        />
      )}

    </div>
  );
}