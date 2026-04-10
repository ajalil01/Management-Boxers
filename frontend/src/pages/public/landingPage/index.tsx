import { useState, useEffect, FC } from "react";
import DarkVeil from "../../../components/backgrounds/DarkVeil";
import logo from "../../../assets/logo.png";
import styles from "./LandingPage.module.css";

// /* FEATURE TYPE */
// interface Feature {
//   icon: string;
//   title: string;
//   description: string;
// }

// /* PRICING PLAN TYPE */
// interface PricingPlan {
//   name: string;
//   price: string;
//   period: string;
//   description: string;
//   features: string[];
//   highlight?: boolean;
// }

/* ---------------- HERO CONTENT ---------------- */
const HeroContent: FC = () => {
  return (
    <div className={styles.heroContainer}>
      <div>
        <h1 className={styles.heroTitle}>
          Build Champions,<br />Win Fights
        </h1>
        <p className={styles.heroSubtitle}>
          Your complete platform for managing boxers, tracking progress, and dominating the ring
        </p>
        <button
          onClick={() =>
            document.getElementById("features")?.scrollIntoView({
              behavior: "smooth",
            })
          }
          className={`${styles.btn} ${styles.btnPrimary}`}
        >
          Explore Now
          <span className={styles.btnIcon}>→</span>
        </button>
      </div>
    </div>
  );
};

/* ---------------- NAVBAR ---------------- */
const Navbar: FC = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""}`}>
      <div className={styles.navLeft}>
        <img src={logo} alt="Zephyr logo" className={styles.logo} />
        <span className={styles.brand}>ZEPHYR</span>
      </div>
      <div className={styles.navCenter}>
        <a href="#features" className={styles.navLink}>Features</a>
        <a href="#pricing" className={styles.navLink}>Pricing</a>
        <a href="#contact" className={styles.navLink}>Contact</a>
      </div>
      <div className={styles.navRight}>
        <button className={`${styles.btn} ${styles.btnSecondary}`}>Sign In</button>
      </div>
    </nav>
  );
};

// /* ---------------- FEATURES SECTION ---------------- */
// const FeaturesSection: FC = () => {
//   const features: Feature[] = [
//     {
//       icon: "📊",
//       title: "Track Progress",
//       description: "Monitor every punch, every improvement. Real-time analytics for your fighters."
//     },
//     {
//       icon: "👥",
//       title: "Team Management",
//       description: "Manage multiple boxers, coaches, and schedules all in one place."
//     },
//     {
//       icon: "🎯",
//       title: "Performance Insights",
//       description: "Data-driven insights to elevate your training and competitive edge."
//     },
//     {
//       icon: "📅",
//       title: "Smart Scheduling",
//       description: "Organize fights, training camps, and events with ease."
//     }
//   ];

//   return (
//     <section id="features" className={styles.section}>
//       <div className={styles.sectionHeader}>
//         <h2>Powerful Features Built for Champions</h2>
//         <p>Everything you need to succeed in the ring</p>
//       </div>
//       <div className={styles.featuresGrid}>
//         {features.map((feature, index) => (
//           <div key={index} className={styles.featureCard}>
//             <div className={styles.featureIcon}>{feature.icon}</div>
//             <h3>{feature.title}</h3>
//             <p>{feature.description}</p>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// };

// /* ---------------- PRICING SECTION ---------------- */
// const PricingSection: FC = () => {
//   const plans: PricingPlan[] = [
//     {
//       name: "Amateur",
//       price: "$29",
//       period: "/month",
//       description: "Perfect to get started",
//       features: ["Up to 3 boxers", "Basic analytics", "Email support"]
//     },
//     {
//       name: "Pro",
//       price: "$79",
//       period: "/month",
//       description: "For serious trainers",
//       features: ["Unlimited boxers", "Advanced analytics", "Priority support", "Team collaboration"],
//       highlight: true
//     },
//     {
//       name: "Champion",
//       price: "Custom",
//       period: "Enterprise",
//       description: "For elite organizations",
//       features: ["Everything in Pro", "Custom integrations", "Dedicated manager", "White-label options"]
//     }
//   ];

//   return (
//     <section id="pricing" className={styles.section}>
//       <div className={styles.sectionHeader}>
//         <h2>Choose Your Ring</h2>
//         <p>Simple, transparent pricing that scales with you</p>
//       </div>
//       <div className={styles.pricingGrid}>
//         {plans.map((plan, index) => (
//           <div key={index} className={`${styles.pricingCard} ${plan.highlight ? styles.highlight : ""}`}>
//             <h3>{plan.name}</h3>
//             <div className={styles.price}>
//               <span className={styles.amount}>{plan.price}</span>
//               <span className={styles.period}>{plan.period}</span>
//             </div>
//             <p className={styles.planDescription}>{plan.description}</p>
//             <button className={`${styles.btn} ${plan.highlight ? styles.btnPrimary : styles.btnSecondary}`}>
//               Get Started
//             </button>
//             <ul className={styles.featuresList}>
//               {plan.features.map((feature, i) => (
//                 <li key={i}>
//                   <span className={styles.check}>✓</span> {feature}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// };

// /* ---------------- CONTACT SECTION ---------------- */
// const ContactSection: FC = () => {
//   return (
//     <section id="contact" className={styles.section}>
//       <div className={styles.sectionHeader}>
//         <h2>Ready to Dominate?</h2>
//         <p>Join thousands of fighters and trainers using Zephyr</p>
//       </div>
//       <div className={styles.contactContent}>
//         <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`}>Start Your Free Trial</button>
//         <p className={styles.contactSubtext}>No credit card required • 14 days free</p>
//       </div>
//     </section>
//   );
// };

/* ---------------- FOOTER ---------------- */
const Footer: FC = () => {
  return (
    <footer className={styles.footer}>
      <p>&copy; 2024 Zephyr. All rights reserved.</p>
      <div className={styles.footerLinks}>
        <a href="#privacy">Privacy</a>
        <a href="#terms">Terms</a>
        <a href="#twitter">Twitter</a>
      </div>
    </footer>
  );
};

/* ---------------- MAIN PAGE COMPONENT ---------------- */
const LandingPage: FC = () => {
  return (
    <div className={styles.page}>
      {/* DARK VEIL BACKGROUND COVERS ENTIRE PAGE */}
      <div className={styles.pageBackground}>
        <DarkVeil
          hueShift={-110}
          noiseIntensity={0}
          scanlineIntensity={0}
          speed={0.5}
          scanlineFrequency={0}
          warpAmount={0}
          resolutionScale={1}
        />
      </div>

      {/* ALL CONTENT ON TOP OF CONSISTENT BACKGROUND */}
      <section className={styles.heroSection}>
        <Navbar />
        <HeroContent />
      </section>

      {/* <FeaturesSection />
      <PricingSection />
      <ContactSection /> */}
      <Footer />
    </div>
  );
};

export default LandingPage;

