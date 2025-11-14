import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Link } from "react-router";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

export const meta = () => ([
    { title: "Resuminds | Results" },
    { name: "description", content: "Detailed overview of your resume" },
])

interface Feedback {
  overallScore: number;
  ATS: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
    }[];
  };
  toneAndStyle: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
  content: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
  structure: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
  skills: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
}

const Resume = () => {
  const { auth, isLoading, fs, kv } = usePuterStore();
  const { id } = useParams();
  const [imageUrl, setImageUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [openSection, setOpenSection] = useState<string | null>('content');
  const navigate = useNavigate();

  useEffect(() => { 
    const loadResume = async () => {
      try {
        const resume = await kv.get(`resume:${id}`);

        if (!resume) {
          console.error('Resume not found');
          setLoading(false);
          return;
        }
        
        const data = JSON.parse(resume);
        console.log('Loaded resume data:', data);

        const resumeBlob = await fs.read(data.resumePath);
        if (!resumeBlob) return;
        const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
        const resumeUrl = URL.createObjectURL(pdfBlob);
        setResumeUrl(resumeUrl);
        
        const imageBlob = await fs.read(data.imagePath);
        if (!imageBlob) return;
        const imageUrl = URL.createObjectURL(imageBlob);
        setImageUrl(imageUrl);

        setFeedback(data.feedback);
        setCompanyName(data.companyName || '');
        setJobTitle(data.jobTitle || '');
        
        console.log({ resumeUrl, imageUrl, feedback: data.feedback });
        setLoading(false);
      } catch (error) {
        console.error('Error loading resume:', error);
        setLoading(false);
      }
    }

    if (id) {
      loadResume();
    }
  }, [id, kv, fs]);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { text: 'great!', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 60) return { text: 'good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 40) return { text: 'needs work', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { text: 'needs work', color: 'text-red-600', bg: 'bg-red-100' };
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <nav className="bg-white shadow-sm px-6 py-4 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium">Back to homepage</span>
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-600">DevOps Engineer</span>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium">Resume Review</span>
        </nav>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-gray-700">Analyzing your resume...</h2>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium">Back to homepage</span>
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-600">DevOps Engineer</span>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium">Resume Review</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"></div>
      </nav>

      <div className="flex flex-row w-full max-lg:flex-col-reverse">
        {/* Left side - Resume Image */}
        <section className="w-1/3 max-lg:w-full bg-gradient-to-br from-blue-100/50 to-purple-100/50 min-h-screen sticky top-0 flex items-center justify-center p-8 max-lg:relative max-lg:min-h-0 max-lg:py-12">
          {imageUrl && resumeUrl && (
            <div className="animate-in fade-in duration-700 w-full max-w-md">
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="group block">
                <div className="bg-white rounded-2xl shadow-xl p-4 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <img
                    src={imageUrl}
                    className="w-full h-auto object-contain rounded-lg"
                    alt="resume preview"
                  />
                </div>
              </a>
            </div>
          )}
        </section>

        {/* Right side - Feedback */}
        <section className="flex-1 p-8 overflow-y-auto max-lg:p-4">
          {feedback ? (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-6">Resume Review</h1>
                
                {/* Score Cards Row */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Overall Score Card */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-gray-600 text-sm font-medium mb-1">Your Resume Score</h3>
                        <p className="text-xs text-gray-500">This score is calculated based on the variables listed below</p>
                      </div>
                    </div>
                    <div className="text-5xl font-bold text-gray-900 mb-2">{feedback.overallScore}/100</div>
                    
                    {/* Mini Score Breakdown */}
                    <div className="space-y-2 mt-4">
                      {[
                        { label: 'Tone & Style', score: feedback.toneAndStyle.score, status: getScoreLabel(feedback.toneAndStyle.score) },
                        { label: 'Structure', score: feedback.structure.score, status: getScoreLabel(feedback.structure.score) },
                        { label: 'Content', score: feedback.content.score, status: getScoreLabel(feedback.content.score) },
                        { label: 'Skills', score: feedback.skills.score, status: getScoreLabel(feedback.skills.score) }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-700 font-medium">{item.label}</span>
                            <span className={`${item.status.bg} ${item.status.color} px-2 py-0.5 rounded text-xs font-medium`}>
                              {item.status.text}
                            </span>
                          </div>
                          <span className="font-bold text-gray-900">{item.score}/100</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ATS Score Card */}
                  <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl p-6 shadow-lg text-white">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <span className="text-lg">🤖</span>
                      </div>
                      <h3 className="font-semibold">ATS Score</h3>
                    </div>
                    <div className="text-5xl font-bold mb-2">{feedback.ATS.score}/100</div>
                    
                    <div className="mt-6 space-y-2">
                      <p className="text-sm font-medium opacity-90">How well does your resume pass through Applicant Tracking Systems?</p>
                      <div className="space-y-1.5 text-sm">
                        {feedback.ATS.tips.slice(0, 3).map((tip, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span>{tip.type === 'good' ? '✓' : '×'}</span>
                            <span className="opacity-90">{tip.tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accordion Sections */}
              <div className="space-y-3">
                {/* Content Section */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <button
                    onClick={() => toggleSection('content')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📝</span>
                      <h3 className="text-lg font-bold text-gray-900">Content</h3>
                      <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                        {feedback.content.score}/100
                      </span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform ${openSection === 'content' ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {openSection === 'content' && (
                    <div className="px-6 pb-6 space-y-4 animate-in fade-in slide-in-from-top duration-300">
                      {feedback.content.tips.map((tip, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg border-l-4 ${
                            tip.type === 'good'
                              ? 'bg-green-50 border-green-500'
                              : 'bg-orange-50 border-orange-500'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xl mt-0.5">
                              {tip.type === 'good' ? '✓' : '⚠️'}
                            </span>
                            <div className="flex-1">
                              <p className={`font-semibold mb-1 ${tip.type === 'good' ? 'text-green-800' : 'text-orange-800'}`}>
                                {tip.tip}
                              </p>
                              {tip.explanation && (
                                <p className="text-sm text-gray-600 leading-relaxed">{tip.explanation}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Skills Section */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <button
                    onClick={() => toggleSection('skills')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">⚡</span>
                      <h3 className="text-lg font-bold text-gray-900">Skills</h3>
                      <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                        {feedback.skills.score}/100
                      </span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform ${openSection === 'skills' ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {openSection === 'skills' && (
                    <div className="px-6 pb-6 space-y-4 animate-in fade-in slide-in-from-top duration-300">
                      {feedback.skills.tips.map((tip, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg border-l-4 ${
                            tip.type === 'good'
                              ? 'bg-green-50 border-green-500'
                              : 'bg-orange-50 border-orange-500'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xl mt-0.5">
                              {tip.type === 'good' ? '✓' : '⚠️'}
                            </span>
                            <div className="flex-1">
                              <p className={`font-semibold mb-1 ${tip.type === 'good' ? 'text-green-800' : 'text-orange-800'}`}>
                                {tip.tip}
                              </p>
                              {tip.explanation && (
                                <p className="text-sm text-gray-600 leading-relaxed">{tip.explanation}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tone & Style Section */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <button
                    onClick={() => toggleSection('toneAndStyle')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🎨</span>
                      <h3 className="text-lg font-bold text-gray-900">Tone & Style</h3>
                      <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-semibold">
                        {feedback.toneAndStyle.score}/100
                      </span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform ${openSection === 'toneAndStyle' ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {openSection === 'toneAndStyle' && (
                    <div className="px-6 pb-6 space-y-4 animate-in fade-in slide-in-from-top duration-300">
                      {feedback.toneAndStyle.tips.map((tip, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg border-l-4 ${
                            tip.type === 'good'
                              ? 'bg-green-50 border-green-500'
                              : 'bg-orange-50 border-orange-500'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xl mt-0.5">
                              {tip.type === 'good' ? '✓' : '⚠️'}
                            </span>
                            <div className="flex-1">
                              <p className={`font-semibold mb-1 ${tip.type === 'good' ? 'text-green-800' : 'text-orange-800'}`}>
                                {tip.tip}
                              </p>
                              {tip.explanation && (
                                <p className="text-sm text-gray-600 leading-relaxed">{tip.explanation}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Structure Section */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <button
                    onClick={() => toggleSection('structure')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🏗️</span>
                      <h3 className="text-lg font-bold text-gray-900">Structure</h3>
                      <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-semibold">
                        {feedback.structure.score}/100
                      </span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform ${openSection === 'structure' ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {openSection === 'structure' && (
                    <div className="px-6 pb-6 space-y-4 animate-in fade-in slide-in-from-top duration-300">
                      {feedback.structure.tips.map((tip, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg border-l-4 ${
                            tip.type === 'good'
                              ? 'bg-green-50 border-green-500'
                              : 'bg-orange-50 border-orange-500'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xl mt-0.5">
                              {tip.type === 'good' ? '✓' : '⚠️'}
                            </span>
                            <div className="flex-1">
                              <p className={`font-semibold mb-1 ${tip.type === 'good' ? 'text-green-800' : 'text-orange-800'}`}>
                                {tip.tip}
                              </p>
                              {tip.explanation && (
                                <p className="text-sm text-gray-600 leading-relaxed">{tip.explanation}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Resume Improvement Checklist */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <button
                    onClick={() => toggleSection('checklist')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">✅</span>
                      <h3 className="text-lg font-bold text-gray-900">Resume Improvement Checklist</h3>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform ${openSection === 'checklist' ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {openSection === 'checklist' && (
                    <div className="px-6 pb-6 space-y-3 animate-in fade-in slide-in-from-top duration-300">
                      {[
                        'Add quantifiable achievements (e.g., "Increased sales by 20%")',
                        'Replace generic phrases with specific outcomes',
                        'Use a professional tone—avoid casual or conversational language',
                        'Remove all first-person pronouns ("I", "me", "my")',
                        'Reorder sections for better impact (e.g., Skills or Key Tech roles)',
                        'Eliminate unnecessary white space or overly dense text',
                        'Add missing soft skills like communication or leadership',
                        'Use a professional tone—avoid casual or conversational language'
                      ].map((item, idx) => (
                        <label key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <input type="checkbox" className="mt-1 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* CTA Button */}
              <div className="text-center mt-12 pb-8">
                <Link 
                  to="/upload" 
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Analyze Another Resume
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <span className="text-6xl mb-4 inline-block">😕</span>
              <h2 className="text-3xl font-bold text-gray-700 mb-2">No Feedback Available</h2>
              <p className="text-gray-500">We couldn't find any analysis data for this resume.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Resume;