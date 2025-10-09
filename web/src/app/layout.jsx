import Providers from "./providers";

export const metadata = {
  title: "Daily Planner App",
  description: "Track your habits, plan your days, and achieve your goals",
};

export default function RootLayout({ children }) {
  return <Providers>{children}</Providers>;
}
