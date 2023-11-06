"use client";
import { signOut } from "next-auth/react";
import { successAlert } from "./Alert";
import { ToastContainer } from "react-toastify";

export default function ShowSession() {
  return (
    <>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-10"
        onClick={() => signOut()}
      >
        Sign Out
      </button>
      <button
        className="bg-violet-500 hover:bg-violet-900 text-white font-bold py-2 px-4 rounded mt-10"
        onClick={() =>
          successAlert({
            message: "Toast!!",
          })
        }
      >
        Toast
      </button>
      <ToastContainer />
    </>
  );
}
