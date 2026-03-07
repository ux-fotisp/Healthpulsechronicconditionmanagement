import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/layout/RootLayout";
import { Home } from "./pages/Home";
import { ProfileView } from "./pages/ProfileView";
import { MedicationsList } from "./pages/MedicationsList";
import { MedicationDetail } from "./pages/MedicationDetail";
import { ObservationsList } from "./pages/ObservationsList";
import { TasksList } from "./pages/TasksList";
import { AppointmentsList } from "./pages/AppointmentsList";
import { LabVault } from "./pages/LabVault";
import { OnboardingWizard } from "./pages/OnboardingWizard";
import { MediFlowHub } from "./pages/MediFlowHub";
import { HealthProfileWizard } from "./pages/HealthProfileWizard";
import { MediFlowVault } from "./pages/MediFlowVault";
import { DesignSystemPage } from "./pages/DesignSystemPage";
import { GoalsTracker } from "./pages/GoalsTracker";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true,                    Component: Home                },
      { path: "profile",                Component: ProfileView         },
      { path: "medications",            Component: MedicationsList     },
      { path: "medications/:id",        Component: MedicationDetail    },
      { path: "observations",           Component: ObservationsList    },
      { path: "tasks",                  Component: TasksList           },
      { path: "appointments",           Component: AppointmentsList    },
      { path: "labs",                   Component: LabVault            },
      { path: "goals",                  Component: GoalsTracker        },
      { path: "onboarding",             Component: OnboardingWizard    },
      // ── MediFlow Design System ──────────────────────────────────
      { path: "mediflow",               Component: MediFlowHub         },
      { path: "mediflow/wizard",        Component: HealthProfileWizard },
      { path: "mediflow/vault",         Component: MediFlowVault       },
      // ── Fluid Design System Showcase ────────────────────────────
      { path: "design-system",          Component: DesignSystemPage    },
    ],
  },
]);