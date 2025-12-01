import { useNavigate } from "react-router-dom";
import { InfoCardLandingPage } from "../components/InfoCardLandingPage";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 text-gray-800">
      <div className="flex-1 flex flex-col items-center w-full">
        <section className="text-center mt-20 max-w-2xl">
          <div className="flex flex-col items-center mb-6">
            <img
              src="/images/logo.png"
              alt="Ev-Logo"
              className="icon-lg mx-auto mb-6"
            />
            <h1 className="text-4xl font-bold">EV TimeCharge</h1>
          </div>

          <p className="center-text-box mb-2">
            Plan time-optimized EV charging sessions that fit your journey.{" "}
            <br />
            Find the perfect charger for your stay - slow when you have time,
            fast when you don't.
          </p>

          <button className="btn-primary" onClick={() => navigate("/login")}>
            Get Started
          </button>
          <p className="text-xs text-gray-500 mt-3">
            Sign in with Google to begin your time charging journey
          </p>
        </section>

        <section className="mt-8 w-full max-w-5xl">
          <h2 className="text-center text-2xl font-bold mb-10">
            Why Choose EV TimeCharge?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-10">
            <InfoCardLandingPage
              title="Time Planning"
              description="Plan your charging session based on destination and trip
                duration."
            />
            <InfoCardLandingPage
              title="Slow Charger Focus"
              description="Find reliable slow chargers where you work, shop, or relax."
            />
            <InfoCardLandingPage
              title="Track Progress"
              description="Monitor charging status with estimated completion time."
            />
          </div>
        </section>

        <section className="mt-8 w-full px-10 mb-8">
          <h2 className="text-center text-2xl font-bold mb-6">How It Works</h2>
          <ol className="space-y-4 text-gray-700 text-left list-decimal list-inside leading-tight pl-0 mx-auto w-fit">
            <li>
              <strong>Enter Your Journey Details</strong> — Add destination,
              time, and battery level.
            </li>
            <li>
              <strong>Get Recommendations</strong> — We suggest the best charger
              for your trip, whether slow or fast.
            </li>
            <li>
              <strong>Navigate & Book</strong> — Get directions and book through
              partner apps.
            </li>
            <li>
              <strong>Track Your Charge</strong> — Monitor charging in
              real-time.
            </li>
          </ol>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="w-full py-6 bg-white border-t text-center text-sm text-gray-500">
        © 2025 EV TimeCharge, Holistic Digital Service Development
      </footer>
    </div>
  );
}
