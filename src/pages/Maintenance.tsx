import { useState } from 'react';
import { FiArrowUpRight, FiMail, FiTool } from 'react-icons/fi';
import ContactModal from '@/components/ContactModal';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function Maintenance() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const { trackButtonClick } = useAnalytics();

  const openContact = () => {
    trackButtonClick('Get in touch', 'maintenance');
    setIsContactModalOpen(true);
  };

  return (
    <>
      <section className="maintenance-section container" aria-labelledby="maintenance-title">
        <div className="maintenance-card">
          <span className="maintenance-status">
            <span aria-hidden="true" /> A little work behind the scenes
          </span>
          <div className="maintenance-icon" aria-hidden="true">
            <FiTool />
          </div>
          <p className="maintenance-eyebrow">RAJ KUMAR <br/> (Software Engineer)</p>
          <h1 id="maintenance-title">Site under maintenance</h1>
          <p className="maintenance-description">
            I’m updating my portfolio. Thanks for your patience while I get
            things ready.
          </p>
          <div className="maintenance-contact">
            <p>Have a project in mind, a question, or just want to say hello?</p>
            <button
              type="button"
              className="maintenance-button"
              aria-haspopup="dialog"
              onClick={openContact}
            >
              <FiMail aria-hidden="true" />
              Get in touch
              <FiArrowUpRight aria-hidden="true" />
            </button>
            <p className="maintenance-note">You can still send me a message here.</p>
          </div>
        </div>
      </section>
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  );
}
