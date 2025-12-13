import React from "react";
import ThemeToggle from "./ThemeToggle";

function Footer() {
  return (
    <footer className="border-t border-app-gray-200 border-dashed grid grid-cols-[150px_1fr_auto] items-center">
      <div></div>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-app-gray-500">
          &copy; {new Date().getFullYear()} Cinema Seat Reservation project by{" "}
          <span className="text-app-blue-600 font-bold ">Khaled Karam</span>.
          All rights reserved.
        </p>
      </div>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <ThemeToggle />
      </div>
    </footer>
  );
}

export default Footer;
