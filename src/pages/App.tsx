import { Button } from "@/components/ui/button";
import { useSession, signOut } from "../lib/auth-client";
import { useEffect } from "react";
import {  useNavigate } from "react-router";


function App() {

  const { data: session, isPending } = useSession();
  const navigate = useNavigate();


  useEffect(() => {
   //  console.log(session);
   if(!isPending && !session){
    navigate("/login");
   }
  }, [session, isPending, navigate]);


  if (isPending) {
    return <div>Loading...</div>;
  }

  if(!session){
    return null;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Home Screen</h1>
      {session && <p>Welcome, {session.user.name}</p>}
      {session && <p>Your Email: {session.user.email}</p>}
      {session ? (
        <Button onClick={() => signOut()}>Logout</Button>
      ) : (
       <p>Please Sign in to access your account</p>
      )}
    </div>
  );
}
export default App;
