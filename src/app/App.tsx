import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import Layout from "./Layout";
import Dashboard from "./pages/dashboard";
import UserManagement from "./pages/user-management";
import LoginPage from "./pages/login";
import Reports from "./pages/reports";

export default function App() {
   return (
      <BrowserRouter>
         <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
               path="/"
               element={
                  <>
                     <SignedIn>
                        <Layout title="Overview">
                           <Dashboard />
                        </Layout>
                     </SignedIn>
                     <SignedOut>
                        <RedirectToSignIn redirectUrl="/login" />
                     </SignedOut>
                  </>
               }
            />
            <Route
               path="/user-management"
               element={
                  <>
                     <SignedIn>
                        <Layout title="User Management">
                           <UserManagement />
                        </Layout>
                     </SignedIn>
                     <SignedOut>
                        <RedirectToSignIn redirectUrl="/login" />
                     </SignedOut>
                  </>
               }
            />
            <Route
               path="/reports"
               element={
                  <>
                     <SignedIn>
                        <Layout title="Reports & Analytics">
                           <Reports />
                        </Layout>
                     </SignedIn>
                     <SignedOut>
                        <RedirectToSignIn redirectUrl="/login" />
                     </SignedOut>
                  </>
               }
            />
         </Routes>
      </BrowserRouter>
   );
}
