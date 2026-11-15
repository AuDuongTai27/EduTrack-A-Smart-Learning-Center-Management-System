import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LandingHeader } from './LandingHeader';
import { LandingFooter } from './LandingFooter';
import { WorkspaceChooser } from '../../components/landing/WorkspaceChooser';
import { useLandingOverview } from '../../components/landing/useLandingOverview';
import { BackToTop } from '../../components/landing/BackToTop';
import '../../../assets/css/landing.css';
export function LandingPageLayout() {
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const landing = useLandingOverview();
  useEffect(() => {
    const language = document.documentElement.lang;
    const title = document.title;
    document.documentElement.lang = 'en';
    document.title = 'EduTrack Learning Center | Find Your Learning Path';
    const meta = document.createElement('meta'); meta.name = 'description';
    meta.content = 'Explore subjects, meet our educators, and find your next class at EduTrack Learning Center. Contact us to discuss your learning goals.';
    document.head.appendChild(meta);
    document.documentElement.classList.add('et-document');
    return () => { document.documentElement.lang = language; document.title = title; meta.remove(); document.documentElement.classList.remove('et-document'); };
  }, []);
  return <div className="et-landing"><LandingHeader onOpenWorkspace={() => setWorkspaceOpen(true)}/><Outlet context={landing}/><LandingFooter/><BackToTop/><WorkspaceChooser isOpen={workspaceOpen} onClose={() => setWorkspaceOpen(false)}/></div>;
}
export default LandingPageLayout;
