import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface messageProps {
  position?:
    | "TOP_CENTER"
    | "TOP_LEFT"
    | "TOP_RIGHT"
    | "BOTTOM_LEFT"
    | "BOTTOM_CENTER"
    | "BOTTOM_RIGHT";
  message: string;
}

const pos = (pos: string) => toast.POSITION[pos as keyof typeof toast.POSITION];

export const simpleAlert = (message: string) => toast.warning(message);

export const successAlert = ({ message, position }: messageProps) =>
  toast.success(message, {
    position: position ? pos(position) : undefined,
  });

export const errorAlert = ({ message, position }: messageProps) =>
  toast.error(message, {
    position: position ? pos(position) : undefined,
    pauseOnHover: true,
  });

export const infoAlert = ({ message, position }: messageProps) =>
  toast.info(message, {
    position: position ? pos(position) : undefined,
    pauseOnHover: true,
  });
