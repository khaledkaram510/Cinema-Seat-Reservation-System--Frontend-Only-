import React from "react";

function Footer() {
  return (
    <footer className="border-t border-app-gray-200 border-dashed">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-app-gray-500">
          &copy; {new Date().getFullYear()} Cinema Seat Reservation project by{" "}
          <span className="text-app-blue-600 font-bold ">Khaled Karam</span>.
          All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
