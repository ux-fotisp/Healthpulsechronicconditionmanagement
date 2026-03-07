import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "sonner";

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif",
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 12,
          },
        }}
        richColors
      />
    </>
  );
}