import { Button } from "@/components/ui/button";
import { signUp, signIn } from "../lib/auth-client";

function App() {
  const handleSignUp = async () => {
    const name = "John Doe";
    const email = "johndoe@example.com";
    const password = "password123";

    const { data, error } = await signUp.email({ name, email, password });
    console.log("data", data);
    console.error("Error signing up:", error);
  };

  const handleSignIn = async () => {
    const email = "johndoe@example.com";
    const password = "password123";

    const { data, error } = await signIn.email({ email, password });
    console.log("data", data);
    console.error("Error signing in:", error);
  }
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Home Screen</h1>
      <Button onClick={handleSignUp}>Sign Up</Button>
      <Button onClick={handleSignIn}>Sign In</Button>
    </div>
  );
}
export default App;
