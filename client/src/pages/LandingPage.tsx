import React from "react";
import Card from "@mui/joy/Card";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    
    <div className="w-full flex flex-col items-center bg-gray-50 text-gray-800">
     
      <section className="text-center mt-20 max-w-2xl">
        <img src="/images/logo.png" alt="Ev-Logo" className="icon-lg mx-auto mb-6" />

        <h1 className="text-4xl font-bold mb-4 leading-tight">
          Plan timer EV charging sessions <br /> that fit your journey
        </h1>
       
        <p  className="center-text-box mb-2">
          Find the perfect slow charger near your destination. Navigate, book,
          and track your charging progress—all in one simple app.
        </p>
       
        <button className="btn-primary" onClick={() => navigate("/login")}>
          Get Started
        </button>
        <p className="text-xs text-gray-500 mt-3">
          Sign in with Google to begin your time charging journey
        </p>
      </section>

      <section className="mt-8 w-full max-w-5xl">
        <h2 className="text-center text-2xl font-bold mb-10">Why Choose EV timeCharge?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-10">
          <Card variant="soft" className="p-6 text-center rounded-xl">
            <h3 className="font-semibold text-lg mb-2">Time Planning</h3>
            <p className="text-sm text-gray-500">Plan your charging session based on destination and trip duration.</p>
          </Card>

          <Card variant="soft" className="p-6 text-center rounded-xl">
            <h3 className="font-semibold text-lg mb-2">Slow Charger Focus</h3>
            <p className="text-sm text-gray-500">Find reliable slow chargers where you work, shop, or relax.</p>
          </Card>

          <Card variant="soft" className="p-6 text-center rounded-xl">
            <h3 className="font-semibold text-lg mb-2">Track Progress</h3>
            <p className="text-sm text-gray-500">Monitor charging status with estimated completion time.</p>
          </Card>
        </div>
      </section>

   <section className="mt-8 w-full max-w-3xl px-10">
  <ol className="space-y-4 text-gray-700 text-left list-decimal list-inside leading-tight pl-0 mx-auto w-fit">
    <li><strong>Enter Your Journey Details</strong> — Add destination, time, and battery level.</li>
    <li><strong>Get Recommendations</strong> — We suggest the best slow chargers.</li>
    <li><strong>Navigate & Book</strong> — Get directions and book through partner apps.</li>
    <li><strong>Track Your Charge</strong> — Monitor charging in real-time.</li>
  </ol>
</section>



      <section className="mt-10 mb-10 text-center">
        <h2 className="text-2xl font-bold mb-3">Ready to charge smarter?</h2>
        <p className="text-gray-600">Join thousands of EV drivers who plan charging efficiently.</p>
      </section>


      {/* FOOTER */}
      <footer className="w-full py-6 bg-white border-t text-center text-sm text-gray-500">
        © 2025 EV timeCharge. All rights reserved.
      </footer>
    </div>
  );
}
