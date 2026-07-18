import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "@/hooks/useAuth";
import SettingsHub, { type SettingsRoute } from "./settings/SettingsHub";
import {
  ProfileScreen,
  EmailPasswordScreen,
  SessionsScreen,
} from "./settings/AccountScreens";
import {
  BusinessInfoScreen,
  GoalsThresholdsScreen,
  TeamScreen,
} from "./settings/BusinessScreens";
import {
  AppearanceScreen,
  NotificationsScreen,
  SociaSettingsScreen,
} from "./settings/PreferencesScreens";
import { DataPrivacyScreen, SupportLegalScreen } from "./settings/SystemScreens";

export default function SettingsScreen({
  onBack,
  onOpenPlans,
  onOpenSocia,
}: {
  onBack: () => void;
  onOpenPlans?: () => void;
  onOpenSocia?: () => void;
}) {
  const { signOut } = useAuth();
  const [route, setRoute] = useState<SettingsRoute | null>(null);

  const goHub = () => setRoute(null);

  const navigate = (r: SettingsRoute) => {
    if (r === "plans") {
      onOpenPlans?.();
      return;
    }
    setRoute(r);
  };

  const renderSub = () => {
    switch (route) {
      case "profile":
        return <ProfileScreen onBack={goHub} />;
      case "email":
        return <EmailPasswordScreen onBack={goHub} />;
      case "sessions":
        return <SessionsScreen onBack={goHub} />;
      case "business":
        return <BusinessInfoScreen onBack={goHub} />;
      case "goals":
        return <GoalsThresholdsScreen onBack={goHub} />;
      case "team":
        return <TeamScreen onBack={goHub} />;
      case "appearance":
        return <AppearanceScreen onBack={goHub} />;
      case "notifications":
        return <NotificationsScreen onBack={goHub} />;
      case "socia":
        return <SociaSettingsScreen onBack={goHub} openThreads={onOpenSocia} />;
      case "data":
        return <DataPrivacyScreen onBack={goHub} />;
      case "help":
        return <SupportLegalScreen onBack={goHub} />;
      default:
        return null;
    }
  };


  return (
    <div className="relative w-full">
      <SettingsHub onBack={onBack} onNavigate={navigate} onSignOut={() => void signOut()} />
      <AnimatePresence>
        {route && (
          <motion.div
            key={route}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed inset-0 z-[65] bg-black overflow-y-auto"
          >
            <div className="mx-auto w-full max-w-[430px] min-h-screen">{renderSub()}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
